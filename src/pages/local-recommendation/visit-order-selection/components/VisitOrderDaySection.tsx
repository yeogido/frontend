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

interface VisitOrderDaySectionProps {
  dayIndex: number;
  events: readonly VisitEvent[];
}

function VisitOrderDaySection({ dayIndex, events }: VisitOrderDaySectionProps) {
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
            <VisitEventItem key={event.id} event={event} order={index + 1} />
          ))}
        </ol>
      </SortableContext>

      {events.length === 0 ? (
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
