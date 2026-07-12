import type { CourseStop } from '../types/course';

import { mockLikeRequest } from '../api/mockLikeRequest';
import { useOptimisticLiked } from '../hooks/useOptimisticLiked';

import { EmptyHeartIcon, FilledHeartIcon } from './icons';

interface CourseStopItemProps {
  stop: CourseStop;
  isLast: boolean;
}

function CourseStopItem({ stop, isLast }: CourseStopItemProps) {
  const { liked, isPending, toggle } = useOptimisticLiked(
    stop.liked,
    mockLikeRequest,
  );
  const HeartIcon = liked ? FilledHeartIcon : EmptyHeartIcon;
  const [transportType, ...transportRest] = (stop.transportToNext ?? '').split(' ');

  return (
    <article className="relative grid grid-cols-[24px_56px_minmax(0,1fr)_22px] gap-2 py-2.5">
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
        className="h-14 w-14 rounded-lg object-cover"
      />

      <div className="min-w-0">
        <h3 className="truncate text-[13px] leading-5 font-bold text-black">
          {stop.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] leading-4 font-normal text-gray-4">
          {stop.address}
        </p>
        <p className="truncate text-[11px] leading-4 font-normal text-gray-4">
          {stop.hours}
        </p>

        {stop.transportToNext && (
          <p className="mt-1 truncate text-[11px] leading-4 font-normal text-gray-4">
            <span className="font-bold">{transportType}</span>{' '}
            {transportRest.join(' ')}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label={`${stop.name} 좋아요 ${liked ? '취소' : '추가'}`}
        aria-pressed={liked}
        aria-busy={isPending}
        disabled={isPending}
        onClick={toggle}
        className={`mt-1 flex h-6 w-6 items-center justify-center disabled:cursor-wait ${liked ? 'text-main-5' : 'text-gray-2'}`}
      >
        <HeartIcon className="h-4 w-4 fill-current" />
      </button>
    </article>
  );
}

export default CourseStopItem;
