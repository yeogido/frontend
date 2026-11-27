import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { DesktopPageShell } from '../../../../components/layout/desktop';
import { useIsDesktop } from '../../../../hooks/useIsDesktop';
import KeywordSelectionDesktopSection from '../../../local-recommendation/tag-selection/desktop/KeywordSelectionDesktopSection';
import RepresentativePhotoDesktopSection from '../../../local-recommendation/tag-selection/desktop/RepresentativePhotoDesktopSection';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';
import type { TagId } from '../../../../types/tag.type';

import BackButton from '../../../local-recommendation/components/BackButton';
import KeywordSelectionSection from '../../../local-recommendation/tag-selection/components/KeywordSelectionSection';
import RepresentativePhotoSection from '../../../local-recommendation/tag-selection/components/RepresentativePhotoSection';
import { toggleTag } from '../../../local-recommendation/tag-selection/utils';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 53;
const BUTTON_TEXT_SIZE = 14;
const BUTTON_RADIUS = 12;

function AdminCoursePhotoTagPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isDesktop = useIsDesktop();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  // photo는 URL.createObjectURL로 만든 blob URL을 들고 있어 store가 유일한
  // 소유자여야 한다. 컴포넌트에 로컬 사본을 두지 않고 변경 즉시 store에 반영한다.
  const photo = useAdminCourseRegistrationStore((state) => state.photo);
  const setPhotoInStore = useAdminCourseRegistrationStore(
    (state) => state.setPhoto
  );
  const keywordTagIds = useAdminCourseRegistrationStore(
    (state) => state.keywordTagIds
  );
  const setKeywordTagIdsInStore = useAdminCourseRegistrationStore(
    (state) => state.setKeywordTagIds
  );
  const existingThumbnailKey = useAdminCourseRegistrationStore(
    (state) => state.existingThumbnailKey
  );
  const setExistingThumbnailKey = useAdminCourseRegistrationStore(
    (state) => state.setExistingThumbnailKey
  );
  const selectedTagIds = new Set(keywordTagIds);
  const [limitMessage, setLimitMessage] = useState('');

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

  if (!region) return null;

  const handlePhotoChange = (file: File | null) => {
    // 사진을 지우면(교체 아님) 기존 key 재사용 폴백도 같이 지워서, "사진
    // 없음"이 진짜로 다시 골라야 하는 상태가 되게 한다.
    if (!file) {
      setExistingThumbnailKey(null);
    }
    setPhotoInStore(
      file ? { file, previewUrl: URL.createObjectURL(file) } : null
    );
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setKeywordTagIdsInStore(Array.from(result.selectedTagIds));
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady =
    (Boolean(photo?.file) || Boolean(existingThumbnailKey)) &&
    selectedTagIds.size > 0;

  const handleSubmit = () => {
    if (!isReady) return;
    navigate('/admin/course-registration/event-selection');
  };

  if (isDesktop) {
    return (
      <DesktopPageShell>
        <div className="flex flex-col gap-[60px]">
          <div className="flex flex-col gap-[24px]">
            <header className="flex flex-col gap-[6px]">
              <h1 className="text-[32px] leading-[38px] font-semibold text-black">
                사진과 키워드를 추가해 주세요
              </h1>
              <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
                코스를 더 매력적으로 소개할 수 있어요!
              </p>
            </header>
            <RepresentativePhotoDesktopSection
              photo={photo}
              onPhotoChange={handlePhotoChange}
            />
            <KeywordSelectionDesktopSection
              selectedTagIds={selectedTagIds}
              limitMessage={limitMessage}
              onToggle={handleTagToggle}
            />
          </div>
          <button
            type="button"
            disabled={!isReady}
            onClick={handleSubmit}
            className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 h-[61px] w-full rounded-[12px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
          >
            코스 선택하기
          </button>
        </div>
      </DesktopPageShell>
    );
  }

  return (
    <ResponsivePageShell
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
      <BackButton
        onClick={() => navigate('/admin/course-registration/basic-info')}
      />
      <main className="flex-1">
        <h1
          className="leading-[1.3] font-bold"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          사진과 키워드를
          <br />
          추가해 주세요
        </h1>
        <p
          className="text-gray-5"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
          }}
        >
          코스를 더 매력적으로 소개할 수 있어요!
        </p>

        <RepresentativePhotoSection
          photo={photo}
          onPhotoChange={handlePhotoChange}
        />
        <KeywordSelectionSection
          selectedTagIds={selectedTagIds}
          limitMessage={limitMessage}
          onToggle={handleTagToggle}
        />
      </main>

      <button
        type="button"
        disabled={!isReady}
        onClick={handleSubmit}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: Math.max(MIN_TOUCH_TARGET, BUTTON_HEIGHT * scale),
          fontSize: BUTTON_TEXT_SIZE * scale,
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        코스 선택하기
      </button>
    </ResponsivePageShell>
  );
}

export default AdminCoursePhotoTagPage;
