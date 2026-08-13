import { useId } from 'react';
import { motion } from 'motion/react';

import folderShadowLayerImage from '../assets/travel-folder-shadow-layer.svg';
import type { TravelRecordFolder } from '../types';
import {
  FOLDER_PHOTO_FRAMES,
  type TravelFolderDecoration,
} from '../folder-decoration/folderDecoration';

import { FolderDecorationRenderer } from './FolderDecorationRenderer';
import { FolderFrontFace } from './FolderFrontFace';
import {
  FOLDER_ARTWORK_HEIGHT,
  FOLDER_ARTWORK_WIDTH,
  FOLDER_FRONT_HEIGHT,
  FOLDER_FRONT_TOP,
  folderClipPathData,
  folderPhotoSlots,
  type FolderPhotoSlot,
} from './folderArtworkLayout';
import {
  getFolderPhotoSlotIndexes,
  getVisibleFolderPhotos,
} from './folderPhotos';

interface TravelFolderCardProps {
  folder: TravelRecordFolder;
  onClick: (folder: TravelRecordFolder) => void;
  isRecentlySaved?: boolean;
}

interface TravelFolderArtworkProps {
  /** 빈 배열이면 사진 없는 빈 폴더로 그린다. */
  photos: readonly string[];
  photoKeys?: string[];
  animatePhotoChanges?: boolean;
  isRecentlySaved?: boolean;
  title: string;
  decorations: TravelFolderDecoration[];
}

function FolderDecorationClip({
  clipId,
  photoSlotIndexes,
}: {
  clipId: string;
  photoSlotIndexes: number[];
}) {
  return (
    <svg
      aria-hidden="true"
      width="159"
      height="183"
      viewBox="0 0 159 183"
      className="pointer-events-none absolute inset-0"
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          {/* 드래그 경계와 같은 값을 써야 스티커가 놓일 수 있는 자리와 실제로
              그려지는 자리가 어긋나지 않는다. 사진이 한 장이면 슬롯 2가 온다. */}
          {photoSlotIndexes.map((slotIndex) => {
            const frame = FOLDER_PHOTO_FRAMES[slotIndex];

            if (!frame) return null;

            return (
              <rect
                key={slotIndex}
                x={frame.centerX - frame.width / 2}
                y={frame.centerY - frame.height / 2}
                width={frame.width}
                height={frame.height}
                rx={frame.radius}
                transform={`rotate(${frame.rotation} ${frame.centerX} ${frame.centerY})`}
              />
            );
          })}
          <path d={folderClipPathData} transform="translate(0 53)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function FolderPhoto({
  folderTitle,
  imageSrc,
  order,
  slot,
  animate,
  isEntering,
}: {
  folderTitle: string;
  imageSrc: string;
  order: number;
  slot: FolderPhotoSlot;
  animate: boolean;
  isEntering: boolean;
}) {
  return (
    <motion.div
      layout={animate}
      initial={
        isEntering ? { opacity: 0, scale: 0.68, x: 16, y: 24, rotate: 5 } : false
      }
      animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{ transformOrigin: 'center bottom' }}
      className={slot.wrapperClassName}
    >
      <div className={slot.frameClassName}>
        <div className="relative size-20 overflow-hidden rounded-xl bg-[#f9f9f9]">
          <div className={slot.cropClassName}>
            <img
              src={imageSrc}
              alt={`${folderTitle} \uC5EC\uD589 \uC0AC\uC9C4 ${order}`}
              className="pointer-events-none absolute inset-0 size-full max-w-none object-cover brightness-[0.96] saturate-[0.94]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TravelFolderArtwork({
  photos,
  photoKeys,
  animatePhotoChanges = false,
  isRecentlySaved = false,
  title,
  decorations,
}: TravelFolderArtworkProps) {
  const decorationClipId = `travel-folder-decoration-${useId().replaceAll(':', '')}`;
  const visiblePhotos = getVisibleFolderPhotos(photos);
  const photoSlotIndexes = getFolderPhotoSlotIndexes(visiblePhotos.length);
  const visiblePhotoKeys = photoKeys?.slice(0, visiblePhotos.length);
  const resolvedPhotoKeys = visiblePhotos.map(
    (_, index) => visiblePhotoKeys?.[index] ?? `${title}-${index}`
  );

  return (
    <div
      className="relative"
      style={{ width: FOLDER_ARTWORK_WIDTH, height: FOLDER_ARTWORK_HEIGHT }}
    >
      <FolderDecorationClip
        clipId={decorationClipId}
        photoSlotIndexes={photoSlotIndexes}
      />
      <img
        src={folderShadowLayerImage}
        alt=""
        className="pointer-events-none absolute top-[38px] left-[-10px] z-0 h-[160px] w-[179px]"
        aria-hidden="true"
      />

      {visiblePhotos.map((imageSrc, index) => (
        <FolderPhoto
          key={resolvedPhotoKeys[index]}
          folderTitle={title}
          imageSrc={imageSrc}
          order={index + 1}
          slot={folderPhotoSlots[photoSlotIndexes[index]]}
          animate={animatePhotoChanges}
          isEntering={animatePhotoChanges}
        />
      ))}

      <FolderFrontFace />
      {isRecentlySaved ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 z-40 overflow-hidden rounded-b-[28px]"
          style={{
            top: FOLDER_FRONT_TOP,
            width: FOLDER_ARTWORK_WIDTH,
            height: FOLDER_FRONT_HEIGHT,
          }}
        >
          <motion.span
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 180, opacity: [0, 0.75, 0] }}
            transition={{ duration: 0.42, ease: 'easeInOut' }}
            className="absolute -top-8 h-[190px] w-12 -rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)]"
          />
        </span>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 z-60 overflow-visible"
        style={{
          WebkitClipPath: `url(#${decorationClipId})`,
          clipPath: `url(#${decorationClipId})`,
        }}
      >
        <FolderDecorationRenderer decorations={decorations} />
      </div>
    </div>
  );
}

function TravelFolderCard({
  folder,
  onClick,
  isRecentlySaved = false,
}: TravelFolderCardProps) {
  return (
    <motion.article
      initial={isRecentlySaved ? { opacity: 0.78, scale: 0.92 } : false}
      animate={
        isRecentlySaved
          ? { opacity: 1, scale: [1, 1.05, 1] }
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.48, ease: 'easeOut' }}
      className="w-[159px]"
    >
      <button
        type="button"
        onClick={() => onClick(folder)}
        aria-label={`${folder.title} \uC5EC\uD589 \uAE30\uB85D \uC0C1\uC138 \uBCF4\uAE30`}
        className="flex w-full justify-center"
      >
        <TravelFolderArtwork
          photos={folder.photos}
          title={folder.title}
          decorations={folder.decorations}
          isRecentlySaved={isRecentlySaved}
        />
      </button>
      <div className="flex flex-col items-center">
        <h2 className="mt-3 text-center text-[16px] leading-none font-medium text-black">
          {folder.title}
        </h2>
        <time className="bg-gray-2 text-gray-4 mt-1.5 rounded-full px-2 py-1 text-[14px] leading-none font-normal">
          {folder.period}
        </time>
      </div>
    </motion.article>
  );
}

export default TravelFolderCard;
