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

import { createLocalRecommendation } from '../../../../apis/localRecommendations';
import { useLocalRecommendationStore } from '../../../../store/localRecommendation.store';
import eventThumbnail from '../assets/event-thumbnail.png';
import { buildCourseRequest } from '../buildCourseRequest';
import { buildVisitEvents } from '../buildVisitEvents';
import type { VisitEvent } from '../constants';

export function useVisitOrderSelection() {
  const draft = useLocalRecommendationStore((state) => state.draft);
  const setVisitOrder = useLocalRecommendationStore(
    (state) => state.setVisitOrder
  );
  const resetDraft = useLocalRecommendationStore((state) => state.resetDraft);

  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>(() =>
    buildVisitEvents(
      draft.places,
      draft.festivals,
      draft.visitOrder,
      eventThumbnail
    )
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

    const activeIndex = visitEvents.findIndex(
      (event) => event.id === active.id
    );
    const overIndex = visitEvents.findIndex(
      (event) => event.id === over.id
    );

    if (activeIndex < 0 || overIndex < 0) return;

    const next = arrayMove(visitEvents, activeIndex, overIndex);
    setVisitEvents(next);
    setVisitOrder(next.map((event) => event.id));
  };

  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = async (): Promise<{ courseId: number } | null> => {
    if (isSubmitting) return null;

    const payload = buildCourseRequest(draft, visitEvents);

    if (!payload) {
      setSubmitError('코스 정보가 모두 입력되어야 등록할 수 있어요.');
      return null;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await createLocalRecommendation(payload);
      resetDraft();
      return result;
    } catch {
      setSubmitError('코스 등록에 실패했어요. 다시 시도해 주세요.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
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
    isSubmitting,
    submitError,
  };
}
