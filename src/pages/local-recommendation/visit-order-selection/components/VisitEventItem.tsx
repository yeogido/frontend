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
// 삭제 버튼은 순서 배지와 같은 자리·같은 크기다(Figma 5998:28948).
const REMOVE_BUTTON_SIZE = 28;
const REMOVE_ICON_SIZE = 18;

interface VisitEventCardProps {
  event: VisitEvent;
  order: number;
  /** 빈 조각(<></>)을 주면 기본 손잡이도 그리지 않는다. */
  dragHandle?: ReactNode;
  /** 편집 모드에서 순서 배지 대신 보여줄 삭제 버튼. */
  leadingControl?: ReactNode;
}

interface SortableVisitEventItemProps {
  event: VisitEvent;
  order: number;
  /** 주면 편집 모드로 본다 — 순서 배지가 삭제 버튼으로 바뀐다. */
  onRemove?: (eventId: string) => void;
  /** 수정 화면의 보기 모드처럼 순서를 바꿀 수 없는 상태. */
  isDragDisabled?: boolean;
}

/** 편집 모드에서 일정을 코스에서 빼는 ⊖ 버튼 — 주황 원에 흰 빼기 기호. */
function RemoveEventButton({
  eventName,
  onClick,
}: {
  eventName: string;
  onClick: () => void;
}) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      aria-label={`${eventName} 일정에서 삭제`}
      onClick={onClick}
      className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-white"
      style={{
        height: REMOVE_BUTTON_SIZE * scale,
        width: REMOVE_BUTTON_SIZE * scale,
      }}
    >
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="fill-none stroke-current stroke-[2]"
        style={{
          height: REMOVE_ICON_SIZE * scale,
          width: REMOVE_ICON_SIZE * scale,
        }}
      >
        <path d="M4 9h10" strokeLinecap="round" />
      </svg>
    </button>
  );
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
  leadingControl,
}: VisitEventCardProps) {
  const scale = useGlobalScale();

  return (
    <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
      {leadingControl ?? (
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
      )}
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

function VisitEventItem({
  event,
  order,
  onRemove,
  isDragDisabled = false,
}: SortableVisitEventItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id, disabled: isDragDisabled });
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
      <VisitEventCard
        event={event}
        order={order}
        dragHandle={isDragDisabled ? <></> : dragHandle}
        leadingControl={
          onRemove ? (
            <RemoveEventButton
              eventName={event.name}
              onClick={() => onRemove(event.id)}
            />
          ) : undefined
        }
      />
    </li>
  );
}

export default VisitEventItem;
