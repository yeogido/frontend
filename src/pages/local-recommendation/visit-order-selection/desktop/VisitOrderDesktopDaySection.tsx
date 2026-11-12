import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { getCourseDayLabel } from '../../../../utils/courseDetail';
import { getDayDroppableId, type VisitEvent } from '../constants';
import AddScheduleDesktopRow from './AddScheduleDesktopRow';
import VisitEventDesktopItem from './VisitEventDesktopItem';

// Figma 1440 데스크톱 시안(6360:38803) 기준 리터럴 px
const ADD_DAY_ICON_SIZE = 24;

interface VisitOrderDesktopDaySectionProps {
  dayIndex: number;
  events: readonly VisitEvent[];
  /** 편집 모드에서만 일정 삭제와 일정 추가 줄을 보여준다. */
  isEditMode?: boolean;
  /** false면 손잡이를 숨기고 정렬도 막는다 — 보기 모드. */
  canReorder?: boolean;
  onRemoveEvent?: (eventId: string) => void;
  onAddSchedule?: (dayIndex: number) => void;
  /** 마지막 일차에만 준다 — 일차 제목 옆의 + 버튼. */
  onAddDay?: () => void;
  isAddDayDisabled?: boolean;
}

function VisitOrderDesktopDaySection({
  dayIndex,
  events,
  isEditMode = false,
  canReorder = true,
  onRemoveEvent,
  onAddSchedule,
  onAddDay,
  isAddDayDisabled = false,
}: VisitOrderDesktopDaySectionProps) {
  // 비어 있는 일차에도 끌어다 놓을 수 있어야 해서 섹션 자체가 드롭 영역이다.
  const { setNodeRef } = useDroppable({ id: getDayDroppableId(dayIndex) });

  return (
    <section ref={setNodeRef} className="flex flex-col gap-[24px]">
      <div className="flex items-center gap-[8px]">
        <h2 className="text-[24px] font-semibold text-black">
          {getCourseDayLabel(dayIndex + 1)}
        </h2>
        {isEditMode && onAddDay ? (
          <button
            type="button"
            aria-label="일차 추가"
            onClick={onAddDay}
            disabled={isAddDayDisabled}
            className="disabled:text-gray-3 flex items-center justify-center text-black"
            style={{ height: ADD_DAY_ICON_SIZE, width: ADD_DAY_ICON_SIZE }}
          >
            <svg
              viewBox="0 0 18 18"
              aria-hidden="true"
              className="fill-none stroke-current stroke-[2]"
              style={{ height: ADD_DAY_ICON_SIZE, width: ADD_DAY_ICON_SIZE }}
            >
              <path d="M9 3v12M3 9h12" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      <SortableContext
        items={events.map((event) => event.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="flex min-w-0 flex-col gap-[16px]">
          {events.map((event, index) => (
            <VisitEventDesktopItem
              key={event.id}
              event={event}
              order={index + 1}
              onRemove={isEditMode ? onRemoveEvent : undefined}
              isDragDisabled={!canReorder}
            />
          ))}
          {isEditMode && onAddSchedule ? (
            <AddScheduleDesktopRow
              day={dayIndex + 1}
              onClick={() => onAddSchedule(dayIndex)}
            />
          ) : null}
        </ol>
      </SortableContext>

      {!isEditMode && events.length === 0 ? (
        <p className="bg-background text-gray-5 flex h-[80px] items-center justify-center rounded-[12px] text-[16px]">
          이 일차에 방문할 장소를 추가해 주세요
        </p>
      ) : null}
    </section>
  );
}

export default VisitOrderDesktopDaySection;
