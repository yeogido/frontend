import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

import type { VisitEvent } from '../constants';

interface VisitEventCardProps {
  event: VisitEvent;
  order: number;
  dragHandle?: ReactNode;
}

interface SortableVisitEventItemProps {
  event: VisitEvent;
  order: number;
}

function DragDots() {
  return (
    <span aria-hidden="true" className="grid grid-cols-2 gap-[3px]">
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className="h-[3px] w-[3px] rounded-full bg-current" />
      ))}
    </span>
  );
}

export function VisitEventCard({
  event,
  order,
  dragHandle,
}: VisitEventCardProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-main-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
        {order}
      </span>
      <article className="flex h-[72px] min-w-0 flex-1 items-center rounded-xl bg-background px-2">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-2">
          <img
            src={event.imageSrc}
            alt=""
            className="h-[95px] w-[71px] max-w-none -translate-x-[7px] -translate-y-5"
          />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <h2 className="truncate text-sm leading-5 font-semibold text-black">
            {event.name}
          </h2>
          <p className="mt-1 truncate text-xs leading-4 text-gray-5">
            {event.address}
          </p>
        </div>
        {dragHandle ?? (
          <span className="p-2 text-gray-3">
            <DragDots />
          </span>
        )}
      </article>
    </div>
  );
}

function VisitEventlsItem({ event, order }: SortableVisitEventItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label="순서 변경"
      {...attributes}
      {...listeners}
      className="touch-none flex cursor-grab items-center justify-center p-2 text-gray-3 active:cursor-grabbing"
    >
      <DragDots />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-0' : undefined}
    >
      <VisitEventCard
        event={event}
        order={order}
        dragHandle={dragHandle}
      />
    </li>
  );
}

export default VisitEventItem;
