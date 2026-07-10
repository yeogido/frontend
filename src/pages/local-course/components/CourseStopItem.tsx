import type { CourseStop } from '../types/course';

import { EmptyHeartIcon } from './icons';

interface CourseStopItemProps {
  stop: CourseStop;
  isLast: boolean;
}

function CourseStopItem({ stop, isLast }: CourseStopItemProps) {
  const [transportType, ...transportRest] = (stop.transportToNext ?? '').split(' ');

  return (
    <article className="relative grid grid-cols-[28px_72px_minmax(0,1fr)_24px] gap-3 py-3">
      <div className="relative flex justify-center">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] text-[12px] font-semibold leading-none text-[var(--color-surface)]">
          {stop.order}
        </span>

        {!isLast && (
          <span className="absolute top-7 h-[58px] border-l border-dashed border-[var(--color-primary)]" />
        )}
      </div>

      <img
        src={stop.image}
        alt={stop.name}
        className="h-[72px] w-[72px] rounded-xl object-cover"
      />

      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-semibold leading-5 text-[var(--color-text)]">
          {stop.name}
        </h3>
        <p className="mt-1 truncate text-[12px] font-normal leading-4 text-[var(--color-text-subtle)]">
          {stop.address}
        </p>
        <p className="truncate text-[12px] font-normal leading-4 text-[var(--color-text-disabled)]">
          {stop.hours}
        </p>

        {stop.transportToNext && (
          <p className="mt-1 truncate text-[12px] font-normal leading-4 text-[var(--color-text-subtle)]">
            <span className="font-semibold">{transportType}</span>{' '}
            {transportRest.join(' ')}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label={`${stop.name} 좋아요`}
        className="mt-1 flex h-6 w-6 items-center justify-center text-[var(--color-text-disabled)]"
      >
        <EmptyHeartIcon className="h-4 w-4" />
      </button>
    </article>
  );
}

export default CourseStopItem;
