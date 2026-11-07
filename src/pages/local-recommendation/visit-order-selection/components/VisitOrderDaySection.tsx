import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { getCourseDayLabel } from '../../../../utils/courseDetail';
import { getDayDroppableId, type VisitEvent } from '../constants';
import VisitEventItem from './VisitEventItem';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const LABEL_SIZE = 16;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 8;
const EMPTY_HEIGHT = 72;
const EMPTY_RADIUS = 12;
const EMPTY_TEXT_SIZE = 13;
const ADD_ROW_HEIGHT = 48;
const ADD_ROW_TEXT_SIZE = 13;

interface VisitOrderDaySectionProps {
  dayIndex: number;
  events: readonly VisitEvent[];
  /** 편집 모드에서만 일정 삭제와 일정 추가 줄을 보여준다. */
  isEditMode?: boolean;
  /** false면 손잡이를 숨기고 정렬도 막는다 — 수정 화면의 보기 모드. */
  canReorder?: boolean;
  onRemoveEvent?: (eventId: string) => void;
  onAddSchedule?: (dayIndex: number) => void;
}

function VisitOrderDaySection({
  dayIndex,
  events,
  isEditMode = false,
  canReorder = true,
  onRemoveEvent,
  onAddSchedule,
}: VisitOrderDaySectionProps) {
  const scale = useGlobalScale();
  // 비어 있는 일차에도 끌어다 놓을 수 있어야 해서 섹션 자체가 드롭 영역이다.
  const { setNodeRef } = useDroppable({ id: getDayDroppableId(dayIndex) });

  return (
    <section ref={setNodeRef} style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <h2
        className="font-semibold text-black"
        style={{ fontSize: Math.max(LABEL_SIZE * scale, 13) }}
      >
        {getCourseDayLabel(dayIndex + 1)}
      </h2>

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
        </ol>
      </SortableContext>

      {isEditMode && onAddSchedule ? (
        <button
          type="button"
          onClick={() => onAddSchedule(dayIndex)}
          className="border-gray-2 text-gray-5 flex w-full items-center justify-center border border-dashed"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            height: Math.max(ADD_ROW_HEIGHT * scale, 44),
            borderRadius: EMPTY_RADIUS * scale,
            fontSize: Math.max(ADD_ROW_TEXT_SIZE * scale, 12),
          }}
        >
          일정을 추가해보세요
        </button>
      ) : null}

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
