import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { getCourseDayLabel } from '../../../../utils/courseDetail';
import { getDayDroppableId, type VisitEvent } from '../constants';
import AddScheduleRow from './AddScheduleRow';
import VisitEventItem from './VisitEventItem';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const LABEL_SIZE = 16;
const LABEL_GAP = 6;
const ADD_DAY_ICON_SIZE = 18;
const ADD_DAY_TOUCH_SIZE = 44;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 8;
const EMPTY_HEIGHT = 72;
const EMPTY_RADIUS = 12;
const EMPTY_TEXT_SIZE = 13;

interface VisitOrderDaySectionProps {
  dayIndex: number;
  events: readonly VisitEvent[];
  /** 편집 모드에서만 일정 삭제와 일정 추가 줄을 보여준다. */
  isEditMode?: boolean;
  /** false면 손잡이를 숨기고 정렬도 막는다 — 수정 화면의 보기 모드. */
  canReorder?: boolean;
  onRemoveEvent?: (eventId: string) => void;
  onAddSchedule?: (dayIndex: number) => void;
  /** 마지막 일차에만 준다 — 일차 제목 옆의 + 버튼. */
  onAddDay?: () => void;
  isAddDayDisabled?: boolean;
}

function VisitOrderDaySection({
  dayIndex,
  events,
  isEditMode = false,
  canReorder = true,
  onRemoveEvent,
  onAddSchedule,
  onAddDay,
  isAddDayDisabled = false,
}: VisitOrderDaySectionProps) {
  const scale = useGlobalScale();
  // 비어 있는 일차에도 끌어다 놓을 수 있어야 해서 섹션 자체가 드롭 영역이다.
  const { setNodeRef } = useDroppable({ id: getDayDroppableId(dayIndex) });
  const addDayInset = (ADD_DAY_TOUCH_SIZE - ADD_DAY_ICON_SIZE * scale) / 2;

  return (
    <section ref={setNodeRef} style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <div className="flex items-center" style={{ gap: LABEL_GAP * scale }}>
        <h2
          className="font-semibold text-black"
          style={{ fontSize: Math.max(LABEL_SIZE * scale, 13) }}
        >
          {getCourseDayLabel(dayIndex + 1)}
        </h2>
        {isEditMode && onAddDay ? (
          <button
            type="button"
            aria-label="일차 추가"
            onClick={onAddDay}
            disabled={isAddDayDisabled}
            className="disabled:text-gray-3 flex items-center justify-center text-black"
            // 디자인상 18px 아이콘이라, 레이아웃을 밀지 않고 터치 영역만 넓힌다.
            style={{
              margin: -addDayInset,
              height: ADD_DAY_TOUCH_SIZE,
              width: ADD_DAY_TOUCH_SIZE,
            }}
          >
            <svg
              viewBox="0 0 18 18"
              aria-hidden="true"
              className="fill-none stroke-current stroke-[2]"
              style={{
                height: ADD_DAY_ICON_SIZE * scale,
                width: ADD_DAY_ICON_SIZE * scale,
              }}
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
        <ol
          className="flex min-w-0 flex-col"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {events.map((event, index) => (
            <VisitEventItem
              key={event.id}
              event={event}
              order={index + 1}
              onRemove={isEditMode ? onRemoveEvent : undefined}
              isDragDisabled={!canReorder}
            />
          ))}
          {isEditMode && onAddSchedule ? (
            <AddScheduleRow
              day={dayIndex + 1}
              onClick={() => onAddSchedule(dayIndex)}
            />
          ) : null}
        </ol>
      </SortableContext>

      {!isEditMode && events.length === 0 ? (
        <p
          className="bg-background text-gray-5 flex items-center justify-center"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            height: EMPTY_HEIGHT * scale,
            borderRadius: EMPTY_RADIUS * scale,
            fontSize: Math.max(EMPTY_TEXT_SIZE * scale, 12),
          }}
        >
          이 일차에 방문할 장소를 추가해 주세요
        </p>
      ) : null}
    </section>
  );
}

export default VisitOrderDaySection;
