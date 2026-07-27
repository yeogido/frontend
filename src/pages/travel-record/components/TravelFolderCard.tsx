import folderFrontLayerImage from '../assets/travel-folder-front-layer.svg';
import folderShadowLayerImage from '../assets/travel-folder-shadow-layer.svg';
import type { TravelRecordFolder } from '../types';
import type { TravelFolderDecoration } from '../folder-decoration/folderDecoration';

import { FolderDecorationRenderer } from './FolderDecorationRenderer';

interface TravelFolderCardProps {
  folder: TravelRecordFolder;
  onClick: (folder: TravelRecordFolder) => void;
}

interface TravelFolderArtworkProps {
  photos: [string, ...string[]];
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
    wrapperClassName:
      'absolute top-[19px] left-[55px] z-10 flex size-[106.675px] items-center justify-center',
    frameClassName:
      'flex size-[88px] rotate-[14deg] items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-8px)] left-1/2 h-[110px] w-[83.008px] -translate-x-1/2 -translate-y-1/2',
  },
];

const folderClipPath =
  'path("M0.550781 116.349C1.42091 123.193 6.87674 128.611 13.752 129.456C6.73587 128.914 1.13324 123.343 0.550781 116.349ZM158.446 116.365C157.856 123.352 152.258 128.915 145.247 129.456C152.117 128.612 157.569 123.202 158.446 116.365ZM15.6328 1.42871H46.5322C51.4001 1.42871 55.9285 3.91111 58.5322 8.00586L59.1846 9.03223C61.9724 13.4168 66.8195 16.0732 72.0283 16.0732H143.367C151.213 16.0733 157.57 22.4087 157.57 30.2188V114.427C157.57 122.237 151.213 128.571 143.367 128.571H15.6328C7.7869 128.571 1.42981 122.237 1.42969 114.427V15.5732C1.42981 7.76327 7.7869 1.42882 15.6328 1.42871ZM150.59 16.8887C154.691 18.955 157.664 22.925 158.349 27.6357C157.546 22.9837 154.615 19.0578 150.59 16.8887ZM13.752 0.542969C6.87897 1.3879 1.42466 6.80318 0.551758 13.6445C1.13731 6.65346 6.73813 1.08516 13.752 0.542969Z")';

function FolderPhoto({
  folderTitle,
  imageSrc,
  order,
  slot,
}: {
  folderTitle: string;
  imageSrc: string;
  order: number;
  slot: FolderPhotoSlot;
}) {
  return (
    <div className={slot.wrapperClassName}>
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
    </div>
  );
}

export function TravelFolderArtwork({
  photos,
  title,
  decorations,
}: TravelFolderArtworkProps) {
  return (
    <div className="relative h-[183px] w-[159px]">
      <img
        src={folderShadowLayerImage}
        alt=""
        className="pointer-events-none absolute top-[38px] left-[-10px] z-0 h-[160px] w-[179px]"
        aria-hidden="true"
      />

      {folderPhotoSlots.map((slot, index) => (
        <FolderPhoto
          key={`${title}-${index}`}
          folderTitle={title}
          imageSrc={photos[index] ?? photos[0]}
          order={index + 1}
          slot={slot}
        />
      ))}

      <div
        className="pointer-events-none absolute top-[53px] left-0 z-20 h-[130px] w-[159px] bg-[rgba(228,228,228,0.28)] backdrop-blur-[50px] [-webkit-backdrop-filter:blur(50px)]"
        style={{
          WebkitClipPath: folderClipPath,
          clipPath: folderClipPath,
        }}
        aria-hidden="true"
      />
      <img
        src={folderFrontLayerImage}
        alt=""
        className="pointer-events-none absolute top-[53px] left-0 z-30 h-[130px] w-[159px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-60 overflow-hidden">
        <FolderDecorationRenderer decorations={decorations} />
      </div>
    </div>
  );
}

function TravelFolderCard({ folder, onClick }: TravelFolderCardProps) {
  return (
    <article className="w-[159px]">
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
    </article>
  );
}

export default TravelFolderCard;
