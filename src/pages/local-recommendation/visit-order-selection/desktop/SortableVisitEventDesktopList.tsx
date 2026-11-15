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

import type { VisitEvent } from '../constants';
import { VisitEventDesktopCard } from './VisitEventDesktopItem';
import VisitOrderDesktopDaySection from './VisitOrderDesktopDaySection';

// 본문 칼럼 폭 — 끌고 있는 카드를 원래 자리와 같은 너비로 띄운다.
const OVERLAY_WIDTH = 742;

interface SortableVisitEventDesktopListProps {
  visitEventsByDay: readonly (readonly VisitEvent[])[];
  activeEvent: VisitEvent | null;
  activeEventOrder: number;
  sensors: SensorDescriptor<SensorOptions>[];
  canReorder?: boolean;
  isEditMode?: boolean;
  onRemoveEvent?: (eventId: string) => void;
  onAddSchedule?: (dayIndex: number) => void;
  onAddDay?: () => void;
  isAddDayDisabled?: boolean;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

function SortableVisitEventDesktopList({
  visitEventsByDay,
  activeEvent,
  activeEventOrder,
  sensors,
  canReorder = true,
  isEditMode = false,
  onRemoveEvent,
  onAddSchedule,
  onAddDay,
  isAddDayDisabled = false,
  onDragStart,
  onDragOver,
  onDragCancel,
  onDragEnd,
}: SortableVisitEventDesktopListProps) {
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
      <div className="flex flex-col gap-[60px]">
        {visitEventsByDay.map((dayEvents, dayIndex) => (
          <VisitOrderDesktopDaySection
            key={dayIndex}
            dayIndex={dayIndex}
            events={dayEvents}
            isEditMode={isEditMode}
            canReorder={canReorder}
            onRemoveEvent={onRemoveEvent}
            onAddSchedule={onAddSchedule}
            // 일차 추가는 마지막 일차 제목 옆에만 붙는다.
            onAddDay={
              dayIndex === visitEventsByDay.length - 1 ? onAddDay : undefined
            }
            isAddDayDisabled={isAddDayDisabled}
          />
        ))}
      </div>

      <DragOverlay adjustScale={false} dropAnimation={null}>
        {activeEvent ? (
          <div style={{ width: OVERLAY_WIDTH }}>
            <VisitEventDesktopCard
              event={activeEvent}
              order={activeEventOrder}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableVisitEventDesktopList;
