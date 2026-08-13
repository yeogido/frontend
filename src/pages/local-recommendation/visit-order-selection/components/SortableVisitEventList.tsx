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

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { getContentWidth } from '../../../../utils/responsiveLayout';
import type { VisitEvent } from '../constants';
import VisitEventItem, { VisitEventCard } from './VisitEventItem';

// Figma 390 디자인 기준 리터럴 px
const LIST_MARGIN_TOP = 32;
const LIST_GAP = 8;

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
  const scale = useGlobalScale();

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
        <ol
          className="flex min-w-0 flex-col"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {visitEvents.map((event, index) => (
            <VisitEventItem key={event.id} event={event} order={index + 1} />
          ))}
        </ol>
      </SortableContext>

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
