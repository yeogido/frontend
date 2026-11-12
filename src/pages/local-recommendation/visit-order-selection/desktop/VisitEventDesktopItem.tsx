import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

import type { VisitEvent } from '../constants';

// Figma 1440 데스크톱 시안(6360:38812) 기준 리터럴 px.
// 모바일과 비율이 달라(썸네일·배지는 그대로인데 글자만 커진다) scale을
// 곱하지 않고 시안 값을 직접 쓴다.
const ROW_GAP = 24;
const BADGE_SIZE = 28;
const CARD_PADDING = 12;
const THUMB_SIZE = 56;
const HANDLE_SIZE = 24;
const REMOVE_ICON_SIZE = 18;

interface VisitEventDesktopCardProps {
  event: VisitEvent;
  order: number;
  /** 빈 조각(<></>)을 주면 손잡이를 그리지 않는다 — 보기 모드. */
  dragHandle?: ReactNode;
  /** 편집 모드에서 순서 배지 대신 보여줄 삭제 버튼. */
  leadingControl?: ReactNode;
}

function DragDots() {
  return (
    <span aria-hidden="true" className="grid grid-cols-2 gap-[4px]">
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className="size-[4px] rounded-full bg-current" />
      ))}
    </span>
  );
}

function RemoveEventButton({
  eventName,
  onClick,
}: {
  eventName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={eventName + ' 일정에서 삭제'}
      onClick={onClick}
      className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ height: BADGE_SIZE, width: BADGE_SIZE }}
    >
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="fill-none stroke-current stroke-[2]"
        style={{ height: REMOVE_ICON_SIZE, width: REMOVE_ICON_SIZE }}
      >
        <path d="M4 9h10" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function VisitEventDesktopCard({
  event,
  order,
  dragHandle,
  leadingControl,
}: VisitEventDesktopCardProps) {
  return (
    <div className="flex items-center" style={{ gap: ROW_GAP }}>
      {leadingControl ?? (
        <span
          className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-[16px] font-semibold text-white"
          style={{ height: BADGE_SIZE, width: BADGE_SIZE }}
        >
          {order}
        </span>
      )}
      <article
        className="bg-background flex min-w-0 flex-1 items-center justify-between rounded-[12px]"
        style={{ padding: CARD_PADDING }}
      >
        <div className="flex min-w-0 items-center gap-[12px]">
          <div
            className="bg-gray-2 shrink-0 overflow-hidden rounded-[12px]"
            style={{ height: THUMB_SIZE, width: THUMB_SIZE }}
          >
            <img
              src={event.imageSrc}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <h3 className="truncate text-[20px] font-semibold text-black">
              {event.name}
            </h3>
            <p className="text-gray-5 truncate text-[16px]">{event.address}</p>
          </div>
        </div>
        {dragHandle ?? (
          <span
            className="text-gray-3 flex shrink-0 items-center justify-center"
            style={{ height: HANDLE_SIZE, width: HANDLE_SIZE }}
          >
            <DragDots />
          </span>
        )}
      </article>
    </div>
  );
}

interface VisitEventDesktopItemProps {
  event: VisitEvent;
  order: number;
  /** 주면 편집 모드로 본다 — 순서 배지가 삭제 버튼으로 바뀐다. */
  onRemove?: (eventId: string) => void;
  /** 보기 모드처럼 순서를 바꿀 수 없는 상태. */
  isDragDisabled?: boolean;
}

function VisitEventDesktopItem({
  event,
  order,
  onRemove,
  isDragDisabled = false,
}: VisitEventDesktopItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id, disabled: isDragDisabled });

  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      aria-label={`${event.name} 순서 변경`}
      {...listeners}
      className="text-gray-3 flex shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      style={{ height: HANDLE_SIZE, width: HANDLE_SIZE }}
    >
      <DragDots />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      // dnd-kit이 주입하는 transform/transition만 담는다.
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? 'opacity-0' : undefined}
    >
      <VisitEventDesktopCard
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

export default VisitEventDesktopItem;
