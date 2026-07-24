import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { initialVisitEvents, type VisitEvent } from '../constants';

export function useVisitOrderSelection() {
  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>(initialVisitEvents);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveEventId(String(active.id));
  };

  const handleDragCancel = () => {
    setActiveEventId(null);
  };

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

  const activeEvent = visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = () => undefined;

  return {
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    handleRegister,
  };
}
