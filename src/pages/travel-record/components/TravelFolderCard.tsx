import type { TravelRecordFolder } from '../types';

interface TravelFolderCardProps {
  folder: TravelRecordFolder;
}

function TravelFolderCard({ folder }: TravelFolderCardProps) {
  return (
    <article className="flex w-[159px] flex-col items-center">
      <div className="relative h-[183px] w-full">
        <div className="absolute top-0 left-[-3px] flex size-[104px] items-center justify-center">
          <div className="flex size-[88px] -rotate-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[2px_2px_2px_rgba(0,0,0,0.15)]">
            <div className="size-20 overflow-hidden rounded-xl bg-white">
              <img
                src={folder.photos[0]}
                alt={`${folder.title} 여행 사진 1`}
                className="h-full w-full rotate-12 scale-[1.18] object-cover"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-[19px] left-[55px] flex size-[106px] items-center justify-center">
          <div className="flex size-[88px] rotate-[14deg] items-center justify-center overflow-hidden rounded-xl bg-white shadow-[2px_2px_2px_rgba(0,0,0,0.15)]">
            <div className="size-20 overflow-hidden rounded-xl bg-white">
              <img
                src={folder.photos[1]}
                alt={`${folder.title} 여행 사진 2`}
                className="h-full w-full rotate-[-14deg] scale-[1.22] object-cover"
              />
            </div>
          </div>
        </div>

        <div
          className="absolute right-0 bottom-0 left-0 h-[114px] overflow-hidden rounded-[15px] border border-white/25 bg-[rgba(180,180,180,0.56)] shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(255,255,255,0.09),inset_0_0_34px_18px_rgba(255,255,255,0.16)] backdrop-blur-[22px] backdrop-brightness-[100%] before:pointer-events-none before:absolute before:top-0 before:right-0 before:left-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] before:content-[''] after:pointer-events-none after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px after:bg-[linear-gradient(180deg,rgba(255,255,255,0.58),transparent,rgba(255,255,255,0.22))] after:content-[''] [-webkit-backdrop-filter:blur(22px)_brightness(100%)]"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-3 text-center text-[16px] leading-none font-medium text-black">
        {folder.title}
      </h2>
      <time className="mt-2 rounded-full bg-gray-2 px-2 py-1 text-[14px] leading-none font-normal text-gray-4">
        {folder.period}
      </time>
    </article>
  );
}

export default TravelFolderCard;
