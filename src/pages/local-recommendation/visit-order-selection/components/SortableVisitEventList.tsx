import {
  closestCorners,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { getContentWidth } from '../../../../utils/responsiveLayout';
import type { VisitEvent } from '../constants';
import { VisitEventCard } from './VisitEventItem';
import VisitOrderDaySection from './VisitOrderDaySection';

interface SortableVisitEventListProps {
  visitEventsByDay: readonly (readonly VisitEvent[])[];
  activeEvent: VisitEvent | null;
  activeEventOrder: number;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

function SortableVisitEventList({
  visitEventsByDay,
  activeEvent,
  activeEventOrder,
  sensors,
  onDragStart,
  onDragOver,
  onDragCancel,
  onDragEnd,
}: SortableVisitEventListProps) {
  const scale = useGlobalScale();

  return (
    <DndContext
      sensors={sensors}
      // 일차를 넘나드는 이동에서는 중심점보다 모서리 기준이 안정적이다.
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      {visitEventsByDay.map((dayEvents, dayIndex) => (
        <VisitOrderDaySection
          key={dayIndex}
          dayIndex={dayIndex}
          events={dayEvents}
        />
      ))}

      <DragOverlay adjustScale={false} dropAnimation={null}>
        {activeEvent ? (
          <div style={{ width: getContentWidth(scale) }}>
            <VisitEventCard event={activeEvent} order={activeEventOrder} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableVisitEventList;
