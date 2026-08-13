import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { VisitEvent } from '../constants';

// Figma 390 디자인 기준 리터럴 px
const DRAG_DOTS_GAP = 3;
const DRAG_DOT_SIZE = 3;
const BADGE_SIZE = 28;
const BADGE_FONT_SIZE = 14;
const ROW_GAP = 12;
const CARD_HEIGHT = 72;
const CARD_PADDING_X = 8;
const THUMB_SIZE = 56;
const IMG_HEIGHT = 95;
const IMG_WIDTH = 71;
const IMG_OFFSET_X = -7;
const IMG_OFFSET_Y = -20;
const TEXT_MARGIN_LEFT = 12;
const TITLE_SIZE = 14;
const TITLE_LINE_HEIGHT = 20;
const ADDRESS_MARGIN_TOP = 4;
const ADDRESS_SIZE = 12;
const ADDRESS_LINE_HEIGHT = 16;
const CARD_RADIUS = 12;
const DRAG_HANDLE_SIZE = 44;

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
  const scale = useGlobalScale();

  return (
    <span
      aria-hidden="true"
      className="grid grid-cols-2"
      style={{ gap: DRAG_DOTS_GAP * scale }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <span
          key={index}
          className="rounded-full bg-current"
          style={{
            height: DRAG_DOT_SIZE * scale,
            width: DRAG_DOT_SIZE * scale,
          }}
        />
      ))}
    </span>
  );
}

export function VisitEventCard({
  event,
  order,
  dragHandle,
}: VisitEventCardProps) {
  const scale = useGlobalScale();

  return (
    <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
      <span
        className="bg-main-5 flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
        style={{
          height: BADGE_SIZE * scale,
          width: BADGE_SIZE * scale,
          fontSize: BADGE_FONT_SIZE * scale,
        }}
      >
        {order}
      </span>
      <article
        className="bg-background flex min-w-0 flex-1 items-center"
        style={{
          height: CARD_HEIGHT * scale,
          paddingLeft: CARD_PADDING_X * scale,
          paddingRight: CARD_PADDING_X * scale,
          borderRadius: CARD_RADIUS * scale,
        }}
      >
        <div
          className="bg-gray-2 shrink-0 overflow-hidden"
          style={{
            height: THUMB_SIZE * scale,
            width: THUMB_SIZE * scale,
            borderRadius: CARD_RADIUS * scale,
          }}
        >
          <img
            src={event.imageSrc}
            alt=""
            className="max-w-none"
            style={{
              height: IMG_HEIGHT * scale,
              width: IMG_WIDTH * scale,
              transform: `translate(${IMG_OFFSET_X * scale}px, ${IMG_OFFSET_Y * scale}px)`,
            }}
          />
        </div>
        <div
          className="min-w-0 flex-1"
          style={{ marginLeft: TEXT_MARGIN_LEFT * scale }}
        >
          <h2
            className="truncate font-semibold text-black"
            style={{
              fontSize: Math.max(TITLE_SIZE * scale, 12),
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            {event.name}
          </h2>
          <p
            className="text-gray-5 truncate"
            style={{
              marginTop: ADDRESS_MARGIN_TOP * scale,
              fontSize: Math.max(ADDRESS_SIZE * scale, 11),
              lineHeight: `${ADDRESS_LINE_HEIGHT * scale}px`,
            }}
          >
            {event.address}
          </p>
        </div>
        {dragHandle ?? (
          <span
            className="text-gray-3 flex shrink-0 items-center justify-center"
            style={{
              height: DRAG_HANDLE_SIZE,
              width: DRAG_HANDLE_SIZE,
            }}
          >
            <DragDots />
          </span>
        )}
      </article>
    </div>
  );
}

function VisitEventItem({ event, order }: SortableVisitEventItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });
  // dnd-kit이 주입하는 transform/transition만 담는다. scale() 등을 병합해 덮어쓰지 않는다.
  const dndStyle = {
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
      className="text-gray-3 flex shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      style={{
        height: DRAG_HANDLE_SIZE,
        width: DRAG_HANDLE_SIZE,
      }}
    >
      <DragDots />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={dndStyle}
      className={isDragging ? 'opacity-0' : undefined}
    >
      <VisitEventCard event={event} order={order} dragHandle={dragHandle} />
    </li>
  );
}

export default VisitEventItem;
