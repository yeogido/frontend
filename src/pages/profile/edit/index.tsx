import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import vector from '../../../assets/icons/vector.svg';
import { getApiErrorMessage } from '../../../apis/common';
import { ResponsivePageShell } from '../../../components/layout';
import { useToast } from '../../../components/toast';
import { BIRTH_YEARS } from '../../../constants/birthYears';
import { useAuth } from '../../../hooks/useAuth';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useMyProfile, useUpdateMyProfile } from '../../../hooks/useMyProfile';
import { useRegions } from '../../../hooks/useRegions';
import type { UpdateMyProfileRequest } from '../../../types/user.type';
import { getNicknameError } from '../../../utils/nickname';
import { getFullRegionName } from '../../../utils/regionName';
import {
  ProfilePhotoEditor,
  type ProfilePhotoEditorHandle,
  UnsavedChangesDialog,
} from '../components';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { ProfileFormField } from './components';
import { getDropdownPanelPosition } from './dropdownPosition';

const SAVE_BUTTON_MARGIN_TOP = 136;

function ProfileEditPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { userId } = useAuth();
  const { showToast } = useToast();
  const { data: profile } = useMyProfile();
  const { data: regionsData } = useRegions();
  const updateMyProfile = useUpdateMyProfile();

  const initialName = profile?.name ?? (userId ? `회원 #${userId}` : '회원');
  const initialRegionId = profile?.regionId ? String(profile.regionId) : '';
  const initialBirthYear = profile?.birthYear ? String(profile.birthYear) : '';

  const [name, setName] = useState(initialName);
  const [regionId, setRegionId] = useState(initialRegionId);
  const [birthYear, setBirthYear] = useState(initialBirthYear);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  const [profileImageKey, setProfileImageKey] = useState<string | undefined>(
    undefined
  );
  const [isPhotoPending, setIsPhotoPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const previousInitialRef = useRef({
    name: initialName,
    regionId: initialRegionId,
    birthYear: initialBirthYear,
  });
  const profilePhotoEditorRef = useRef<ProfilePhotoEditorHandle>(null);

  useEffect(() => {
    const previous = previousInitialRef.current;

    setName((current) => (current === previous.name ? initialName : current));
    setRegionId((current) =>
      current === previous.regionId ? initialRegionId : current
    );
    setBirthYear((current) =>
      current === previous.birthYear ? initialBirthYear : current
    );
    previousInitialRef.current = {
      name: initialName,
      regionId: initialRegionId,
      birthYear: initialBirthYear,
    };
  }, [initialName, initialRegionId, initialBirthYear]);

  const regionOptions = useMemo(
    () => [
      { value: '', label: '사는 지역을 선택해 주세요' },
      ...(regionsData?.regions ?? []).map((region) => ({
        value: String(region.regionId),
        label: getFullRegionName(region.name),
      })),
    ],
    [regionsData?.regions]
  );
  const birthYearOptions = useMemo(
    () => [
      { value: '', label: '태어난 연도를 입력해 주세요' },
      ...BIRTH_YEARS.map((year) => ({ value: year, label: year })),
    ],
    []
  );

  const nicknameError = name !== initialName ? getNicknameError(name) : null;
  const isEdited =
    name !== initialName ||
    regionId !== initialRegionId ||
    birthYear !== initialBirthYear ||
    isPhotoChanged;
  const canSave =
    isEdited &&
    !nicknameError &&
    !updateMyProfile.isPending &&
    !isPhotoPending;
  const unsavedChangesGuard = useUnsavedChangesGuard(isEdited);

  const handleBack = () => {
    unsavedChangesGuard.requestNavigation(() => navigate('/profile'));
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSubmitError(null);

    const uploadedPhotoKey =
      profileImageKey ??
      (isPhotoChanged
        ? await profilePhotoEditorRef.current?.commitPendingPhoto()
        : undefined);

    if (isPhotoChanged && !uploadedPhotoKey) {
      return;
    }

    const payload: UpdateMyProfileRequest = {};
    if (name !== initialName) payload.nickname = name;
    if (birthYear !== initialBirthYear && birthYear)
      payload.birthYear = birthYear;
    if (regionId !== initialRegionId && regionId)
      payload.regionId = Number(regionId);
    if (uploadedPhotoKey) payload.profileImageUrl = uploadedPhotoKey;

    // 지역/출생연도를 빈 값으로 되돌리거나, 사진을 골랐지만 업로드가 아직
    // 끝나지 않았거나 실패한 경우 isEdited는 true지만 실제로 보낼 필드가
    // 없다. 빈 PATCH를 보내고 성공 토스트를 띄우면 사용자에게는 거짓
    // 성공이 된다.
    if (Object.keys(payload).length === 0) {
      navigate('/profile');
      return;
    }

    try {
      await updateMyProfile.mutateAsync(payload);
      showToast('프로필을 저장했어요.');
      navigate('/profile');
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, '프로필 저장에 실패했어요.'));
    }
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      bottomPadding={32}
      className="relative bg-[#f9f9f9]"
    >
      <button
        type="button"
        onClick={handleBack}
        aria-label="프로필로 돌아가기"
        className="absolute left-0 flex items-center justify-center"
        style={{ top: 6 * scale, width: 72 * scale, height: 44 * scale }}
      >
        <img
          src={vector}
          alt=""
          aria-hidden="true"
          style={{
            width: 10 * scale,
            height: 16 * scale,
            transform: 'rotate(180deg)',
            filter: 'brightness(0.22)',
          }}
        />
      </button>

      <main
        className="flex flex-1 flex-col items-center"
        style={{ paddingTop: 56 * scale }}
      >
        <ProfilePhotoEditor
          ref={profilePhotoEditorRef}
          scale={scale}
          initialPhotoUrl={profile?.profileImageUrl}
          onPhotoChange={() => {
            setIsPhotoChanged(true);
            setProfileImageKey(undefined);
          }}
          onPhotoUploaded={setProfileImageKey}
          onPendingChange={setIsPhotoPending}
        />

        <form
          className="flex w-full flex-col"
          style={{ marginTop: 24 * scale, gap: 24 * scale }}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <ProfileFormField
            label="이름"
            scale={scale}
            error={nicknameError ?? undefined}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-full w-full bg-transparent font-medium text-[#7f7f7f] outline-none"
              style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
            />
          </ProfileFormField>

          <ProfileFormField label="이메일" scale={scale}>
            <span
              aria-readonly="true"
              className="font-medium text-[#7f7f7f]"
              style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
            >
              {profile?.email ?? '등록된 이메일 정보가 없어요'}
            </span>
          </ProfileFormField>

          <ProfileFormField label="사는 지역" scale={scale}>
            <SelectField
              value={regionId}
              onChange={setRegionId}
              options={regionOptions}
              scale={scale}
              ariaLabel="사는 지역"
            />
          </ProfileFormField>

          <ProfileFormField label="태어난 연도" scale={scale}>
            <SelectField
              value={birthYear}
              onChange={setBirthYear}
              options={birthYearOptions}
              scale={scale}
              ariaLabel="태어난 연도"
            />
          </ProfileFormField>

          {submitError && (
            <p
              role="alert"
              className="text-main-5 font-medium"
              style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
            >
              {submitError}
            </p>
          )}
        </form>

        <button
          type="button"
          disabled={!canSave}
          onClick={() => void handleSave()}
          className="enabled:bg-main-5 flex w-full items-center justify-center rounded-xl font-semibold enabled:text-[#f9f9f9] disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
          style={{
            marginTop: SAVE_BUTTON_MARGIN_TOP * scale,
            height: 52 * scale,
            paddingInline: 10 * scale,
            fontSize: 18 * scale,
            lineHeight: `${21 * scale}px`,
          }}
        >
          프로필 저장
        </button>
      </main>

      <UnsavedChangesDialog
        isOpen={unsavedChangesGuard.isDialogOpen}
        onConfirm={unsavedChangesGuard.onConfirm}
        onCancel={unsavedChangesGuard.onCancel}
      />
    </ResponsivePageShell>
  );
}

function SelectField({
  value,
  onChange,
  options,
  scale,
  ariaLabel,
  triggerLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  scale: number;
  ariaLabel: string;
  // 옵션 목록은 그대로 두고, 닫힌 상태에서 보이는 트리거 텍스트만 다른
  // 값(예: 축약형 대신 풀네임)으로 보여주고 싶을 때 쓴다.
  triggerLabel?: string;
}) {
  const buttonId = useId();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>();
  const [scrollThumb, setScrollThumb] = useState<{
    top: number;
    height: number;
  }>();
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const displayLabel = triggerLabel ?? selectedOption?.label;
  const panelHeight = Math.min(options.length * 46, 184) * scale;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelStyle = () => {
      const button = rootRef.current?.querySelector('button');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const panelPosition = getDropdownPanelPosition({
        triggerTop: rect.top,
        triggerBottom: rect.bottom,
        viewportHeight: window.innerHeight,
        preferredHeight: panelHeight,
        gap: 4 * scale,
        viewportInset: 8 * scale,
      });

      setPanelStyle({
        top: panelPosition.top,
        left: rect.left,
        width: rect.width,
        height: panelPosition.height,
      });
    };

    updatePanelStyle();
    window.addEventListener('resize', updatePanelStyle);
    window.addEventListener('scroll', updatePanelStyle, true);

    return () => {
      window.removeEventListener('resize', updatePanelStyle);
      window.removeEventListener('scroll', updatePanelStyle, true);
    };
  }, [isOpen, panelHeight, scale]);

  useEffect(() => {
    if (!isOpen) return;

    const updateScrollThumb = () => {
      const listbox = listboxRef.current;
      if (!listbox || listbox.scrollHeight <= listbox.clientHeight) {
        setScrollThumb(undefined);
        return;
      }

      const inset = 8 * scale;
      const trackHeight = listbox.clientHeight - inset * 2;
      const thumbHeight = Math.max(
        32 * scale,
        (listbox.clientHeight / listbox.scrollHeight) * trackHeight
      );
      const maxThumbTop = trackHeight - thumbHeight;
      const progress =
        listbox.scrollTop / (listbox.scrollHeight - listbox.clientHeight);

      setScrollThumb({
        top: inset + maxThumbTop * progress,
        height: thumbHeight,
      });
    };

    const animationFrame = requestAnimationFrame(updateScrollThumb);
    const delayedUpdate = window.setTimeout(updateScrollThumb, 0);
    const resizeObserver = new ResizeObserver(updateScrollThumb);
    if (listboxRef.current) {
      resizeObserver.observe(listboxRef.current);
    }
    window.addEventListener('resize', updateScrollThumb);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(delayedUpdate);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollThumb);
    };
  }, [isOpen, options.length, scale]);

  const moveScrollbarToPointer = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    const listbox = listboxRef.current;
    const panel = event.currentTarget.parentElement;
    if (!listbox || !panel || !scrollThumb) return;

    const panelRect = panel.getBoundingClientRect();
    const inset = 8 * scale;
    const trackHeight = listbox.clientHeight - inset * 2;
    const maxThumbTop = trackHeight - scrollThumb.height;
    const pointerTop = event.clientY - panelRect.top;
    const nextThumbTop = Math.min(
      Math.max(pointerTop - scrollThumb.height / 2, inset),
      inset + maxThumbTop
    );
    const progress =
      maxThumbTop === 0 ? 0 : (nextThumbTop - inset) / maxThumbTop;

    listbox.scrollTop =
      progress * (listbox.scrollHeight - listbox.clientHeight);
  };

  return (
    <div ref={rootRef} className="relative flex h-full w-full items-center">
      <button
        id={buttonId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-full w-full items-center justify-between bg-transparent text-left font-medium text-[#7f7f7f] outline-none"
        style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
      >
        <span className="truncate">{displayLabel}</span>
        <img
          src={vector}
          alt=""
          aria-hidden="true"
          className="shrink-0 transition-transform"
          style={{
            width: 10 * scale,
            height: 6 * scale,
            transform: `rotate(${isOpen ? -90 : 90}deg)`,
          }}
        />
      </button>

      {isOpen && panelStyle
        ? createPortal(
            <div
              id={listboxId}
              ref={panelRef}
              className="fixed z-[60] overflow-hidden rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              style={panelStyle}
            >
              <div
                ref={listboxRef}
                role="listbox"
                aria-labelledby={buttonId}
                onScroll={() => {
                  const listbox = listboxRef.current;
                  if (!listbox || !scrollThumb) return;

                  const inset = 8 * scale;
                  const trackHeight = listbox.clientHeight - inset * 2;
                  const maxThumbTop = trackHeight - scrollThumb.height;
                  const progress =
                    listbox.scrollTop /
                    (listbox.scrollHeight - listbox.clientHeight);
                  setScrollThumb({
                    top: inset + maxThumbTop * progress,
                    height: scrollThumb.height,
                  });
                }}
                className="h-full [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
              >
                {options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center border-b border-[#e4e4e4] text-left font-medium text-[#7f7f7f] last:border-b-0 ${isSelected ? 'bg-[#e4e4e4]' : 'bg-[#f9f9f9]'}`}
                      style={{
                        height: 46 * scale,
                        paddingInline: 14 * scale,
                        fontSize: 12 * scale,
                        lineHeight: `${14 * scale}px`,
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {scrollThumb && (
                <button
                  type="button"
                  aria-label="목록 스크롤"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    moveScrollbarToPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    ) {
                      moveScrollbarToPointer(event);
                    }
                  }}
                  className="absolute top-0 right-0 bottom-0 w-[16px] cursor-pointer touch-none"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[5px] w-[6px] rounded-full bg-[#a1a1a1]"
                    style={{ top: scrollThumb.top, height: scrollThumb.height }}
                  />
                </button>
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default ProfileEditPage;
