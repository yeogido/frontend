import type { CourseStop } from '../types/course';

import { EmptyHeartIcon } from './icons';

interface CourseStopItemProps {
  stop: CourseStop;
  isLast: boolean;
}

function CourseStopItem({ stop, isLast }: CourseStopItemProps) {
  const [transportType, ...transportRest] = (stop.transportToNext ?? '').split(' ');

  return (
    <article className="relative grid grid-cols-[24px_56px_minmax(0,1fr)_22px] gap-2 py-2.5 min-[360px]:grid-cols-[28px_64px_minmax(0,1fr)_24px] min-[360px]:gap-3">
      <div className="relative flex justify-center">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-main-5 text-[11px] leading-none font-semibold text-white">
          {stop.order}
        </span>

        {!isLast && (
          <span className="absolute top-7 h-[68px] border-l border-dashed border-main-5" />
        )}
      </div>

      <img
        src={stop.image}
        alt={stop.name}
        className="h-14 w-14 rounded-lg object-cover min-[360px]:h-16 min-[360px]:w-16"
      />

      <div className="min-w-0">
        <h3 className="truncate text-[13px] leading-5 font-bold text-black min-[360px]:text-[14px]">
          {stop.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] leading-4 font-normal text-gray-4 min-[360px]:text-[12px]">
          {stop.address}
        </p>
        <p className="truncate text-[11px] leading-4 font-normal text-gray-4 min-[360px]:text-[12px]">
          {stop.hours}
        </p>

        {stop.transportToNext && (
          <p className="mt-1 truncate text-[11px] leading-4 font-normal text-gray-4 min-[360px]:text-[12px]">
            <span className="font-bold">{transportType}</span>{' '}
            {transportRest.join(' ')}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label={`${stop.name} 좋아요`}
        className="mt-1 flex h-6 w-6 items-center justify-center text-gray-2"
      >
        <EmptyHeartIcon className="h-4 w-4 fill-current" />
      </button>
    </article>
  );
}

export default CourseStopItem;
