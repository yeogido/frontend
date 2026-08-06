import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';

import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';
import eventThumbnail from '../../../local-recommendation/visit-order-selection/assets/event-thumbnail.png';
import type { VisitEvent } from '../../../local-recommendation/visit-order-selection/constants';
import { buildAdminVisitEvents } from './buildAdminVisitEvents';

export function useAdminCourseVisitOrder() {
  const selectedPlaces = useAdminCourseRegistrationStore(
    (state) => state.selectedPlaces
  );
  const selectedEvents = useAdminCourseRegistrationStore(
    (state) => state.selectedEvents
  );
  const storedVisitOrder = useAdminCourseRegistrationStore(
    (state) => state.visitOrder
  );
  const setVisitOrderInStore = useAdminCourseRegistrationStore(
    (state) => state.setVisitOrder
  );

  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>(() =>
    storedVisitOrder.length > 0
      ? storedVisitOrder
      : buildAdminVisitEvents(selectedPlaces, selectedEvents, eventThumbnail)
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveEventId(String(active.id));
  const handleDragCancel = () => setActiveEventId(null);
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveEventId(null);
    if (!over || active.id === over.id) return;

    const activeIndex = visitEvents.findIndex(
      (event) => event.id === active.id
    );
    const overIndex = visitEvents.findIndex((event) => event.id === over.id);
    if (activeIndex < 0 || overIndex < 0) return;

    const next = arrayMove(visitEvents, activeIndex, overIndex);
    setVisitEvents(next);
    setVisitOrderInStore(next);
  };

  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = () => {
    setVisitOrderInStore(visitEvents);
  };

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
