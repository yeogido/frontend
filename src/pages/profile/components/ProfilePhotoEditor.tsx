import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';

import loadingIcon from '../../../assets/icons/loading.svg';
import pen from '../../../assets/icons/pen.svg';
import { getApiErrorMessage } from '../../../apis/common';
import { createPresignedUrl, uploadFileToPresignedUrl } from '../../../apis/files.api';
import { useToast } from '../../../components/toast';
import { ProfilePhotoPreview, type ProfilePhoto } from './ProfilePhotoPreview';
import {
  canSavePendingProfilePhoto,
  PROFILE_PHOTO_BACKGROUND_COLOR,
} from './profilePhotoSave';

const PHOTO_FRAME_SIZE = 120;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
// 원본 파일이 아니라 zoom/position이 반영된 결과물을 올려야 해서,
// PHOTO_FRAME_SIZE(120) 기준 배율로 캔버스에 다시 그려 내보낸다. 4배면
// 작은 원형 아바타 용도로 충분히 선명하다.
const AVATAR_EXPORT_SIZE = PHOTO_FRAME_SIZE * 4;
const AVATAR_EXPORT_MIME = 'image/jpeg';
const AVATAR_EXPORT_QUALITY = 0.9;
const PHOTO_LOAD_ERROR_MESSAGE = '사진을 불러오지 못했어요.';
const UPLOAD_ERROR_MESSAGE = '사진 업로드에 실패했어요.';

interface ProfilePhotoEditorProps {
  readonly scale: number;
  readonly onPhotoChange?: () => void;
  // objectKey 업로드가 성공할 때마다 호출된다. 실제 계정에 반영하는 건
  // 폼의 다른 필드와 동일하게 "프로필 저장" 시점(PATCH)이다.
  // 반환값을 await한다 — 호출부가 Promise를 돌려주면(예: PATCH까지
  // 이어서 저장) 그게 끝나야 "확정"으로 반영한다. reject되면 업로드
  // 실패와 동일하게 재시도 가능한 상태로 되돌린다.
  readonly onPhotoUploaded?: (objectKey: string) => void | Promise<void>;
  // 사진을 고른 뒤 구도 확정(업로드 성공)까지 아직 끝나지 않은 상태 전체를
  // 알린다. 저장 버튼은 이 동안 비활성화해야 안전하다 — 그렇지 않으면
  // 빈 payload로 저장되면서 사진 변경이 조용히 사라질 수 있다.
  readonly onPendingChange?: (isPending: boolean) => void;
  readonly initialPhotoUrl?: string | null;
}

export interface ProfilePhotoEditorHandle {
  commitPendingPhoto: () => Promise<string | null>;
}

export const ProfilePhotoEditor = forwardRef<
  ProfilePhotoEditorHandle,
  ProfilePhotoEditorProps
>(function ProfilePhotoEditor({
  scale,
  onPhotoChange,
  onPhotoUploaded,
  onPendingChange,
  initialPhotoUrl,
}, ref) {
  const { showToast } = useToast();
  const [savedPhoto, setSavedPhoto] = useState<ProfilePhoto | null>(null);
  const [draftPhoto, setDraftPhoto] = useState<ProfilePhoto | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isAdjustmentEnabled, setIsAdjustmentEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // 파일 읽기/원본 비율 계산(첫 await 전)도 큰 파일에서는 시간이 걸려,
  // 이 구간에도 저장 버튼이 눌릴 수 있다. isTransforming/isUploading과
  // 별개로 이 구간 자체를 pending으로 알린다.
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 파일 선택과 구도 확정(commit) 시도를 모두 하나의 시퀀스로 취급한다.
  // 새 선택이나 새 확정 시도가 시작되면 값을 올려서, 그 이전 비동기
  // 작업(로컬 미리보기 생성, 업로드)의 응답이 늦게 와도 무시하게 만든다.
  const attemptIdRef = useRef(0);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    x: number;
    y: number;
    positionX: number;
    positionY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  // "마지막으로 반영한 URL"을 들고 있어서, initialPhotoUrl이 다른 값으로
  // 바뀔 때마다(예: 업로드 후 쿼리가 refetch되어 서버 URL이 갱신될 때)
  // 다시 반영할 수 있다. StrictMode의 effect 이중 실행(mount→cleanup→
  // mount)에서 취소된 시도가 "이미 반영함"으로 잘못 기록되지 않도록,
  // setSavedPhoto를 실제로 호출한 뒤에만(= .then 콜백 안에서) 갱신한다.
  const lastSeededPhotoUrlRef = useRef<string | null>(null);
  // 사용자가 사진을 한 번이라도 직접 고르면(handleFileChange) true로
  // 고정한다. 그 이후로는 initialPhotoUrl이 나중에 바뀌어도(예: 서버
  // 값이 아직 예전 사진일 때) 이 effect가 로컬 편집 결과를 되돌리지
  // 않는다 — commitPhoto가 끝나며 isTransforming/isUploading이 바뀌는
  // 순간 이 effect가 재실행되어 방금 확정한 사진을 예전 값으로 덮어쓰던
  // 문제를 막는다.
  const hasUserInteractedRef = useRef(false);
  const photo = draftPhoto ?? savedPhoto;

  useEffect(() => {
    if (!initialPhotoUrl) return;
    if (hasUserInteractedRef.current) return;
    if (initialPhotoUrl === lastSeededPhotoUrlRef.current) return;

    let isCancelled = false;

    void getImageAspectRatio(initialPhotoUrl).then((aspectRatio) => {
      if (isCancelled) return;

      lastSeededPhotoUrlRef.current = initialPhotoUrl;
      setSavedPhoto({
        src: initialPhotoUrl,
        zoom: MIN_ZOOM,
        positionX: 0,
        positionY: 0,
        aspectRatio,
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [initialPhotoUrl]);

  // isTransforming(구도 조정/확정 대기)이나 isUploading(업로드 네트워크
  // 요청) 둘 중 하나라도 진행 중이면 아직 "저장해도 되는 확정 상태"가
  // 아니다. 부모(프로필 수정 화면)가 이 동안 저장 버튼을 막을 수 있도록
  // 알려준다.
  useEffect(() => {
    onPendingChange?.(isUploading || isProcessingFile);
  }, [isTransforming, isUploading, isProcessingFile, onPendingChange]);

  const updateTransform = (update: (current: ProfilePhoto) => ProfilePhoto) => {
    setDraftPhoto((current) => {
      const source = current ?? savedPhoto;
      return source ? clampPhotoPosition(update(source)) : source;
    });
    setIsTransforming(true);
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;

    hasUserInteractedRef.current = true;
    const attemptId = ++attemptIdRef.current;
    setIsProcessingFile(true);

    try {
      const src = await readImageFile(file);
      const aspectRatio = await getImageAspectRatio(src);

      if (attemptId !== attemptIdRef.current) return null;

      setDraftPhoto({
        src,
        zoom: MIN_ZOOM,
        positionX: 0,
        positionY: 0,
        aspectRatio,
      });
      // 드래그/핀치로 조정하지 않고 바로 체크 버튼을 눌러도 기본 구도(가운데
      // 정렬)를 확정할 수 있도록 조정 가능 상태로 바로 진입한다.
      setIsTransforming(true);
      setIsAdjustmentEnabled(true);
      onPhotoChange?.();
    } catch (error) {
      if (attemptId !== attemptIdRef.current) return null;

      showToast(getApiErrorMessage(error, PHOTO_LOAD_ERROR_MESSAGE));
    } finally {
      if (attemptId === attemptIdRef.current) {
        setIsProcessingFile(false);
      }
    }
  };

  const commitPhoto = useCallback(async (committedPhoto: ProfilePhoto) => {
    const attemptId = ++attemptIdRef.current;

    setIsTransforming(false);
    setIsAdjustmentEnabled(false);

    if (!onPhotoUploaded) {
      // 업로드 연동이 없는 화면(조회 화면)에서는 로컬 미리보기만 확정한다.
      setSavedPhoto(committedPhoto);
      setDraftPhoto(null);
      return null;
    }

    // 구도 조정 자체를 잃지 않도록 조정 화면으로 되돌린다 — 재선택부터
    // 다시 시키지 않고 체크 버튼만 다시 누르면 재시도할 수 있게 한다.
    const rollbackToRetry = () => {
      setDraftPhoto(committedPhoto);
      setIsTransforming(true);
      setIsAdjustmentEnabled(true);
    };

    setIsUploading(true);

    try {
      const croppedFile = await createCroppedPhotoFile(committedPhoto);
      const presignedUrl = await createPresignedUrl({
        fileName: croppedFile.name,
        contentType: AVATAR_EXPORT_MIME,
      });
      await uploadFileToPresignedUrl(
        presignedUrl.uploadUrl,
        croppedFile,
        AVATAR_EXPORT_MIME
      );

      if (attemptId !== attemptIdRef.current) return null;

      try {
        // 호출부가 Promise를 돌려주면(예: PATCH까지 이어서 저장) 그게
        // 끝나야 진짜 "확정"이다. 실패하면 호출부가 이미 자신만의 에러
        // 토스트를 띄웠다고 보고, 여기서는 추가 토스트 없이 재시도
        // 가능한 상태로만 되돌린다.
        await onPhotoUploaded(presignedUrl.objectKey);
      } catch {
        if (attemptId === attemptIdRef.current) rollbackToRetry();
        return null;
      }

      if (attemptId !== attemptIdRef.current) return null;

      // 업로드와 호출부의 저장까지 실제로 성공한 뒤에야 "확정된" 사진으로
      // 반영한다.
      setSavedPhoto(committedPhoto);
      setDraftPhoto(null);
      return presignedUrl.objectKey;
    } catch (error) {
      if (attemptId !== attemptIdRef.current) return null;

      showToast(getApiErrorMessage(error, UPLOAD_ERROR_MESSAGE));
      rollbackToRetry();
      return null;
    } finally {
      if (attemptId === attemptIdRef.current) {
        setIsUploading(false);
      }
    }
  }, [onPhotoUploaded, showToast]);

  useImperativeHandle(
    ref,
    () => ({
      commitPendingPhoto: async () => {
        if (
          !canSavePendingProfilePhoto({
            hasPendingPhoto: Boolean(draftPhoto),
            isProcessingFile,
            isUploading,
          }) ||
          !draftPhoto
        ) {
          return null;
        }

        return commitPhoto(draftPhoto);
      },
    }),
    [commitPhoto, draftPhoto, isProcessingFile, isUploading]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!photo || !isAdjustmentEnabled) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        positionX: photo.positionX,
        positionY: photo.positionY,
      };
      return;
    }

    if (pointersRef.current.size === 2) {
      pinchRef.current = {
        distance: getPointerDistance(pointersRef.current),
        zoom: photo.zoom,
      };
      dragRef.current = null;
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !photo ||
      !isAdjustmentEnabled ||
      !pointersRef.current.has(event.pointerId)
    )
      return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const nextZoom = clampZoom(
        pinchRef.current.zoom *
          (getPointerDistance(pointersRef.current) / pinchRef.current.distance)
      );
      updateTransform((current) => ({ ...current, zoom: nextZoom }));
      return;
    }

    if (pointersRef.current.size === 1 && dragRef.current) {
      const { x, y, positionX, positionY } = dragRef.current;
      updateTransform((current) => ({
        ...current,
        positionX: positionX + (event.clientX - x) / scale,
        positionY: positionY + (event.clientY - y) / scale,
      }));
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    dragRef.current = null;
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!photo || !isAdjustmentEnabled) return;

    updateTransform((current) => ({
      ...current,
      zoom: clampZoom(current.zoom - event.deltaY * 0.002),
    }));
  };

  const handleActionClick = () => {
    if (isTransforming && draftPhoto) {
      void commitPhoto(draftPhoto);
      return;
    }

    fileInputRef.current?.click();
  };

  const isBusy = isUploading || isProcessingFile;

  return (
    <div className="relative">
      <ProfilePhotoPreview
        photo={photo}
        scale={scale}
        isAdjustable={isAdjustmentEnabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        isProcessingFile={isProcessingFile}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          void handleFileChange(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={handleActionClick}
        disabled={isBusy}
        aria-label={
          isBusy
            ? isUploading
              ? '프로필 사진 업로드 중'
              : '프로필 사진 처리 중'
            : isTransforming
              ? '프로필 사진 편집 저장'
              : '프로필 사진 수정'
        }
        className="absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-[#f9f9f9]/80 disabled:opacity-70"
        style={{ width: 30 * scale, height: 30 * scale }}
      >
        {isBusy ? (
          <img
            src={loadingIcon}
            alt=""
            aria-hidden="true"
            className="animate-spin"
            style={{ width: 18 * scale, height: 18 * scale }}
          />
        ) : isTransforming ? (
          <RoundedCheck scale={scale} />
        ) : (
          <img
            src={pen}
            alt=""
            aria-hidden="true"
            style={{ width: 20 * scale, height: 20 * scale }}
          />
        )}
      </button>
    </div>
  );
});

function clampPhotoPosition(photo: ProfilePhoto) {
  const aspectRatio = photo.aspectRatio || 1;
  const baseWidth =
    aspectRatio >= 1 ? PHOTO_FRAME_SIZE * aspectRatio : PHOTO_FRAME_SIZE;
  const baseHeight =
    aspectRatio >= 1 ? PHOTO_FRAME_SIZE : PHOTO_FRAME_SIZE / aspectRatio;
  const maxOffsetX = Math.max(
    0,
    (baseWidth * photo.zoom - PHOTO_FRAME_SIZE) / 2
  );
  const maxOffsetY = Math.max(
    0,
    (baseHeight * photo.zoom - PHOTO_FRAME_SIZE) / 2
  );

  return {
    ...photo,
    positionX: Math.min(maxOffsetX, Math.max(-maxOffsetX, photo.positionX)),
    positionY: Math.min(maxOffsetY, Math.max(-maxOffsetY, photo.positionY)),
  };
}

function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

function getPointerDistance(pointers: Map<number, { x: number; y: number }>) {
  const [first, second] = Array.from(pointers.values());
  return first && second
    ? Math.hypot(first.x - second.x, first.y - second.y)
    : 1;
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageAspectRatio(src: string) {
  return new Promise<number>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth / image.naturalHeight || 1);
    image.onerror = () => resolve(1);
    image.src = src;
  });
}

// ProfilePhotoPreview가 그리는 CSS transform(translate(-50% + position*scale)
// scale(zoom))과 동일한 결과가 나오도록, 같은 수식을 캔버스 좌표로 재현해
// zoom/position이 실제로 반영된 이미지를 만든다.
function createCroppedPhotoFile(photo: ProfilePhoto): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_EXPORT_SIZE;
      canvas.height = AVATAR_EXPORT_SIZE;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('캔버스를 생성하지 못했습니다.'));
        return;
      }

      const renderScale = AVATAR_EXPORT_SIZE / PHOTO_FRAME_SIZE;
      context.fillStyle = PROFILE_PHOTO_BACKGROUND_COLOR;
      context.fillRect(0, 0, AVATAR_EXPORT_SIZE, AVATAR_EXPORT_SIZE);
      const aspectRatio = photo.aspectRatio || 1;
      const baseWidth =
        aspectRatio >= 1
          ? AVATAR_EXPORT_SIZE * aspectRatio
          : AVATAR_EXPORT_SIZE;
      const baseHeight =
        aspectRatio >= 1
          ? AVATAR_EXPORT_SIZE
          : AVATAR_EXPORT_SIZE / aspectRatio;
      const drawWidth = baseWidth * photo.zoom;
      const drawHeight = baseHeight * photo.zoom;
      const centerX = AVATAR_EXPORT_SIZE / 2 + photo.positionX * renderScale;
      const centerY = AVATAR_EXPORT_SIZE / 2 + photo.positionY * renderScale;

      context.drawImage(
        image,
        centerX - drawWidth / 2,
        centerY - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지를 변환하지 못했습니다.'));
            return;
          }

          resolve(
            new File([blob], 'profile.jpg', { type: AVATAR_EXPORT_MIME })
          );
        },
        AVATAR_EXPORT_MIME,
        AVATAR_EXPORT_QUALITY
      );
    };

    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    image.src = photo.src;
  });
}

function RoundedCheck({ scale }: { scale: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative block"
      style={{ width: 18 * scale, height: 14 * scale }}
    >
      <span
        className="absolute rounded-full bg-[#ff6f41]"
        style={{
          width: 8 * scale,
          height: 3.5 * scale,
          left: 1 * scale,
          top: 8 * scale,
          transform: 'rotate(45deg)',
        }}
      />
      <span
        className="absolute rounded-full bg-[#ff6f41]"
        style={{
          width: 13 * scale,
          height: 3.5 * scale,
          left: 5 * scale,
          top: 5 * scale,
          transform: 'rotate(-45deg)',
        }}
      />
    </span>
  );
}
