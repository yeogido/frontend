import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';

import pen from '../../../assets/icons/pen.svg';
import { ProfilePhotoPreview, type ProfilePhoto } from './ProfilePhotoPreview';

const PHOTO_FRAME_SIZE = 120;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface ProfilePhotoEditorProps {
  readonly scale: number;
  readonly onPhotoChange?: () => void;
}

export function ProfilePhotoEditor({
  scale,
  onPhotoChange,
}: ProfilePhotoEditorProps) {
  const [savedPhoto, setSavedPhoto] = useState<ProfilePhoto | null>(null);
  const [draftPhoto, setDraftPhoto] = useState<ProfilePhoto | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isAdjustmentEnabled, setIsAdjustmentEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileSelectionIdRef = useRef(0);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    x: number;
    y: number;
    positionX: number;
    positionY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const photo = draftPhoto ?? savedPhoto;

  const updateTransform = (update: (current: ProfilePhoto) => ProfilePhoto) => {
    setDraftPhoto((current) => {
      const source = current ?? savedPhoto;
      return source ? clampPhotoPosition(update(source)) : source;
    });
    setIsTransforming(true);
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;

    const selectionId = ++fileSelectionIdRef.current;
    const src = await readImageFile(file);
    const nextPhoto: ProfilePhoto = {
      src,
      zoom: MIN_ZOOM,
      positionX: 0,
      positionY: 0,
      aspectRatio: await getImageAspectRatio(src),
    };

    if (selectionId !== fileSelectionIdRef.current) return;

    setSavedPhoto(nextPhoto);
    setDraftPhoto(nextPhoto);
    setIsTransforming(false);
    setIsAdjustmentEnabled(true);
    onPhotoChange?.();
  };

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
      setSavedPhoto(draftPhoto);
      setIsTransforming(false);
      setIsAdjustmentEnabled(false);
      return;
    }

    fileInputRef.current?.click();
  };

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
        aria-label={
          isTransforming ? '프로필 사진 편집 저장' : '프로필 사진 수정'
        }
        className="absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-[#f9f9f9]/80"
        style={{ width: 30 * scale, height: 30 * scale }}
      >
        {isTransforming ? (
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
}

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
