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
  /** false면 순서를 바꿀 수 없다 — 수정 화면의 보기 모드. */
  canReorder?: boolean;
  /** 수정 화면의 편집 모드에서만 삭제·일정 추가·일차 추가가 보인다. */
  isEditMode?: boolean;
  onRemoveEvent?: (eventId: string) => void;
  onAddSchedule?: (dayIndex: number) => void;
  /** 마지막 일차 제목 옆의 + 버튼. */
  onAddDay?: () => void;
  /** 일차 상한에 닿으면 추가 버튼을 비활성화한다. */
  isAddDayDisabled?: boolean;
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
