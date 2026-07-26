import type { CourseStop } from '../types/courseDetail';

export interface CourseStopItemProps {
  readonly stop: CourseStop;
  readonly isLast: boolean;
  readonly onLikeToggle?: () => void;
}

export function CourseStopItem({ stop, isLast, onLikeToggle }: CourseStopItemProps) {
  const [transportType, ...transportRest] = (stop.transportToNext ?? '').split(' ');

  return (
    <article className="relative grid grid-cols-[20px_52px_minmax(0,1fr)_22px] items-start gap-3 py-2">
      <div className="relative flex h-full flex-col items-center pt-0.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF5C38] text-[11px] leading-none font-bold text-white shadow-xs">
          {stop.order}
        </span>

        {!isLast && (
          <span className="my-1.5 w-0 flex-1 border-l border-dashed border-[#FF5C38]/60" />
        )}
      </div>

      <img
        src={stop.image}
        alt={stop.name}
        className="h-[52px] w-[52px] rounded-[10px] object-cover"
      />

      <div className="min-w-0 pt-0.5">
        <h3 className="truncate text-[14px] leading-tight font-bold text-[#1C1C1C]">
          {stop.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] leading-4 font-normal text-[#888888]">
          {stop.address}
        </p>
        {stop.hours && (
          <p className="truncate text-[11px] leading-4 font-normal text-[#888888]">
            {stop.hours}
          </p>
        )}

        {stop.transportToNext && (
          <p className="mt-1 truncate text-[11px] leading-4 font-normal text-[#888888]">
            <span className="font-semibold text-[#666666]">{transportType}</span>{' '}
            {transportRest.join(' ')}
          </p>
        )}
      </div>

      {onLikeToggle && (
        <button
          type="button"
          aria-label={`${stop.name} 좋아요 ${stop.liked ? '취소' : '추가'}`}
          aria-pressed={stop.liked}
          onClick={onLikeToggle}
          className={`mt-0.5 flex h-6 w-6 items-center justify-center ${
            stop.liked ? 'text-[#FF5C38]' : 'text-gray-300'
          }`}
        >
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}
    </article>
  );
}

export default CourseStopItem;
