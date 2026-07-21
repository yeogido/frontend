import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { initialVisitEvents } from './constants';
import VisitEventItem, { VisitEventCard } from './components/VisitEventItem';

function VisitOrderSelectionPage() {
  const navigate = useNavigate();
  const [visitEvents, setVisitEvents] = useState(initialVisitEvents);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveEventId(null);

    if (!over || active.id === over.id) return;
    setVisitEvents((currentEvents) => {
      const activeIndex = currentEvents.findIndex(
        (event) => event.id === active.id
      );
      const overIndex = currentEvents.findIndex((event) => event.id === over.id);

      return activeIndex < 0 || overIndex < 0
        ? currentEvents
        : arrayMove(currentEvents, activeIndex, overIndex);
    });
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveEventId(String(active.id));
  };

  const handleDragCancel = () => {
    setActiveEventId(null);
  };

  const activeEvent = visitEvents.find((event) => event.id === activeEventId);
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = () => undefined;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-hidden bg-white px-6 pt-[60px] pb-[30px]">
      <button
        type="button"
        aria-label="이전 화면으로"
        onClick={() => navigate(-1)}
        className="-ml-1 flex h-6 w-6 items-center justify-center text-gray-5"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-[2.2]">
          <path d="m15 4-8 8 8 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <section className="mt-4">
        <h1 className="text-[28px] leading-[1.32] font-bold tracking-[-0.04em] text-black">
          방문 순서를
          <br />
          설정해 주세요
        </h1>
        <p className="mt-3 text-sm leading-5 tracking-[-0.03em] text-gray-5">
          드래그하여 순서를 변경할 수 있어요
        </p>
      </section>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
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

      <button
        type="button"
        onClick={handleRegister}
        className="bg-main-5 mt-[50px] h-[54px] w-full shrink-0 rounded-xl text-base font-semibold text-white"
      >
        코스 등록하기
      </button>
    </main>
  );
}

export default VisitOrderSelectionPage;
