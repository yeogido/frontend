import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { uploadCourseImages } from '../../../../apis/files';
import { createLocalRecommendation } from '../../../../apis/localRecommendations';
import {
  LOCAL_RECOMMENDATION_COVER_IMAGE_ID,
  useLocalRecommendationStore,
} from '../../../../store/localRecommendation.store';
import eventThumbnail from '../assets/event-thumbnail.png';
import {
  buildCourseRequest,
  getCourseRequestValidationError,
} from '../buildCourseRequest';
import { buildVisitEvents } from '../buildVisitEvents';
import type { VisitEvent } from '../constants';

export function useVisitOrderSelection() {
  const draft = useLocalRecommendationStore((state) => state.draft);
  const pendingImages = useLocalRecommendationStore(
    (state) => state.pendingImages
  );
  const imageRecoveryRequired = useLocalRecommendationStore(
    (state) => state.imageRecoveryRequired
  );
  const navigate = useNavigate();
  const setVisitOrder = useLocalRecommendationStore(
    (state) => state.setVisitOrder
  );
  const resetDraft = useLocalRecommendationStore((state) => state.resetDraft);
  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>(() =>
    buildVisitEvents(
      draft.places,
      draft.festivals,
      draft.visitOrder,
      eventThumbnail,
      new Map(
        Object.entries(pendingImages).map(([placeId, image]) => [
          placeId,
          image.previewUrl,
        ])
      )
    )
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!imageRecoveryRequired) return;
    navigate('/local-recommendation/tag-selection', { replace: true });
  }, [imageRecoveryRequired, navigate]);

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
    setVisitOrder(next.map((event) => event.id));
  };

  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = async (): Promise<{ courseId: number } | null> => {
    if (isSubmitting) return null;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const store = useLocalRecommendationStore.getState();
      const { draft: currentDraft, pendingImages } = store;
      const coverImage = pendingImages[LOCAL_RECOMMENDATION_COVER_IMAGE_ID];

      if (!coverImage) {
        throw new Error('대표 사진 정보를 찾을 수 없습니다. 사진을 다시 등록해 주세요.');
      }

      const placeImageUploads = currentDraft.places.flatMap((place) => {
        const pendingImage = pendingImages[place.id];
        return pendingImage ? [{ placeId: place.id, pendingImage }] : [];
      });
      const files = await Promise.all([coverImage, ...placeImageUploads.map(
        ({ pendingImage }) => pendingImage
      )].map(async (pendingImage) =>
        pendingImage.compressedFile ??
        (await pendingImage.compressionPromise) ??
        pendingImage.originalFile
      ));
      const [coverImageKey, ...placeImageKeys] = await uploadCourseImages(files);
      const imageKeyByPlaceId = new Map(
        placeImageUploads.map(({ placeId }, index) => [
          placeId,
          placeImageKeys[index],
        ])
      );
      const eventsWithImageKeys = visitEvents.map((event) =>
        event.kind === 'PLACE'
          ? {
              ...event,
              imageKey: imageKeyByPlaceId.get(event.id) ?? event.imageKey,
            }
          : event
      );
      const validationError = getCourseRequestValidationError(
        { ...currentDraft, coverImageKey },
        eventsWithImageKeys
      );
      if (validationError) throw new Error(validationError);

      const payload = buildCourseRequest(
        { ...currentDraft, coverImageKey },
        eventsWithImageKeys
      );

      if (!payload) {
        throw new Error('코스 정보가 모두 입력되어야 등록할 수 있습니다.');
      }

      const result = await createLocalRecommendation(payload);
      resetDraft();
      return result;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : '코스 등록에 실패했습니다. 다시 시도해 주세요.'
      );
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
