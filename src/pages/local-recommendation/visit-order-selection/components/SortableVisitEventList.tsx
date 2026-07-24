import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { VisitEvent } from '../constants';
import VisitEventItem, { VisitEventCard } from './VisitEventItem';

interface SortableVisitEventListProps {
  visitEvents: readonly VisitEvent[];
  activeEvent: VisitEvent | null;
  activeEventOrder: number;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

function SortableVisitEventList({
  visitEvents,
  activeEvent,
  activeEventOrder,
  sensors,
  onDragStart,
  onDragCancel,
  onDragEnd,
}: SortableVisitEventListProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={visitEvents.map((event) => event.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="mt-8 flex flex-col gap-2">
          {visitEvents.map((event, index) => (
            <VisitEventItem key={event.id} event={event} order={index + 1} />
          ))}
        </ol>
      </SortableContext>

      <DragOverlay adjustScale={false} dropAnimation={null}>
        {activeEvent ? (
          <VisitEventCard event={activeEvent} order={activeEventOrder} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableVisitEventList;
