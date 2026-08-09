import profile from '../../../assets/icons/profile.svg';
import type { PointerEventHandler, WheelEventHandler } from 'react';
import { PROFILE_PHOTO_BACKGROUND_COLOR } from './profilePhotoSave';

export interface ProfilePhoto {
  src: string;
  zoom: number;
  positionX: number;
  positionY: number;
  aspectRatio: number;
}

export function ProfilePhotoPreview({
  photo,
  scale,
  size = 120,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  isAdjustable = false,
}: {
  photo: ProfilePhoto | null;
  scale: number;
  size?: number;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onWheel?: WheelEventHandler<HTMLDivElement>;
  isAdjustable?: boolean;
}) {
  const scaledSize = size * scale;
  const aspectRatio = photo?.aspectRatio ?? 1;
  const imageWidth = (aspectRatio >= 1 ? size * aspectRatio : size) * scale;
  const imageHeight = (aspectRatio >= 1 ? size : size / aspectRatio) * scale;

  return (
    <div
      className={`relative overflow-hidden rounded-full ${photo && isAdjustable ? 'cursor-move touch-none' : ''}`}
      style={{
        width: scaledSize,
        height: scaledSize,
        backgroundColor: PROFILE_PHOTO_BACKGROUND_COLOR,
        touchAction: photo && isAdjustable ? 'none' : 'auto',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      {photo ? (
        <img
          src={photo.src}
          alt="프로필 사진 미리보기"
          className="absolute top-1/2 left-1/2 max-w-none"
          style={{
            width: imageWidth,
            height: imageHeight,
            transform: `translate(calc(-50% + ${photo.positionX * scale}px), calc(-50% + ${photo.positionY * scale}px)) scale(${photo.zoom})`,
          }}
        />
      ) : (
        <img
          src={profile}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 5 * scale, width: scaledSize, height: 115 * scale }}
        />
      )}
    </div>
  );
}
