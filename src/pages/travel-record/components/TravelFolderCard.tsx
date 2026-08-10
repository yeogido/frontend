import { useId } from 'react';
import { motion } from 'motion/react';

import folderShadowLayerImage from '../assets/travel-folder-shadow-layer.svg';
import type { TravelRecordFolder } from '../types';
import {
  FOLDER_PHOTO_FRAMES,
  type TravelFolderDecoration,
} from '../folder-decoration/folderDecoration';

import { FolderDecorationRenderer } from './FolderDecorationRenderer';
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
  photos: [string, ...string[]];
  photoKeys?: string[];
  animatePhotoChanges?: boolean;
  isRecentlySaved?: boolean;
  title: string;
  decorations: TravelFolderDecoration[];
}

interface FolderPhotoSlot {
  wrapperClassName: string;
  frameClassName: string;
  cropClassName: string;
}

const folderPhotoSlots: FolderPhotoSlot[] = [
  {
    wrapperClassName:
      'absolute top-0 left-[-3px] z-10 flex size-[104.373px] items-center justify-center',
    frameClassName:
      'flex size-[88px] -rotate-12 items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-0.19px)] left-[-12.19px] size-[104px] -translate-y-1/2',
  },
  {
    // 대표 사진이 놓이는 자리. 렌더 순서와 무관하게 왼쪽 사진 위로 겹치도록
    // z-index를 한 단계 높인다.
    wrapperClassName:
      'absolute top-[19px] left-[55px] z-11 flex size-[106.675px] items-center justify-center',
    frameClassName:
      'flex size-[88px] rotate-[14deg] items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-8px)] left-1/2 h-[110px] w-[83.008px] -translate-x-1/2 -translate-y-1/2',
  },
  {
    // 사진 한 장은 폴더 앞면 안쪽으로 더 들어간 전용 슬롯을 사용한다.
    wrapperClassName:
      'absolute top-[27px] left-[55px] z-11 flex size-[106.675px] items-center justify-center',
    frameClassName:
      'flex size-[88px] rotate-[14deg] items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-8px)] left-1/2 h-[110px] w-[83.008px] -translate-x-1/2 -translate-y-1/2',
  },
];

const folderClipPathData =
  'M0.550781 116.349C1.42091 123.193 6.87674 128.611 13.752 129.456C6.73587 128.914 1.13324 123.343 0.550781 116.349ZM158.446 116.365C157.856 123.352 152.258 128.915 145.247 129.456C152.117 128.612 157.569 123.202 158.446 116.365ZM15.6328 1.42871H46.5322C51.4001 1.42871 55.9285 3.91111 58.5322 8.00586L59.1846 9.03223C61.9724 13.4168 66.8195 16.0732 72.0283 16.0732H143.367C151.213 16.0733 157.57 22.4087 157.57 30.2188V114.427C157.57 122.237 151.213 128.571 143.367 128.571H15.6328C7.7869 128.571 1.42981 122.237 1.42969 114.427V15.5732C1.42981 7.76327 7.7869 1.42882 15.6328 1.42871ZM150.59 16.8887C154.691 18.955 157.664 22.925 158.349 27.6357C157.546 22.9837 154.615 19.0578 150.59 16.8887ZM13.752 0.542969C6.87897 1.3879 1.42466 6.80318 0.551758 13.6445C1.13731 6.65346 6.73813 1.08516 13.752 0.542969Z';

const folderClipPath = `path("${folderClipPathData}")`;

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

function FolderFrontBorder() {
  const borderGradientId = `travel-folder-border-${useId().replaceAll(':', '')}`;

  return (
    <svg
      aria-hidden="true"
      width="159"
      height="130"
      viewBox="0 0 159 130"
      className="pointer-events-none absolute top-[53px] left-0 z-30"
    >
      <defs>
        <linearGradient
          id={borderGradientId}
          x1="79.5"
          y1="0"
          x2="79.5"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.56" />
          <stop offset="0.46" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="1" stopColor="#898989" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <path
        d={folderClipPathData}
        fill="none"
        stroke={`url(#${borderGradientId})`}
      />
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
    <div className="relative h-[183px] w-[159px]">
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

      <div
        className="pointer-events-none absolute top-[53px] left-0 z-20 h-[130px] w-[159px] overflow-hidden backdrop-blur-[22px] [-webkit-backdrop-filter:blur(22px)]"
        style={{
          WebkitClipPath: folderClipPath,
          clipPath: folderClipPath,
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.11) 42%, rgba(228, 228, 228, 0.1) 100%), rgba(255, 255, 255, 0.16)',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 -10px 18px rgba(90, 90, 90, 0.08), inset 0 0 30px 14px rgba(255, 255, 255, 0.22)',
        }}
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_34%,rgba(70,70,70,0.16))]" />
        <span className="absolute top-0 left-0 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)]" />
      </div>
      <FolderFrontBorder />
      {isRecentlySaved ? (
        <span className="pointer-events-none absolute top-[53px] left-0 z-40 h-[130px] w-[159px] overflow-hidden rounded-b-[28px]" aria-hidden="true">
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
