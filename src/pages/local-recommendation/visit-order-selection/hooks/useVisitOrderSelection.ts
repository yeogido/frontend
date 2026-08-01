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

import { uploadCourseImages } from '../../../../apis/files';
import {
  createLocalRecommendation,
  type CourseItem,
  type CreateLocalRecommendationRequest,
} from '../../../../apis/localRecommendations';
import { useLocalRecommendationStore } from '../../../../store/localRecommendation.store';
import { initialVisitEvents, type VisitEvent } from '../constants';

const durationTypeByValue = {
  'day-trip': 'DAY_TRIP',
  '1-night-2-days': 'ONE_NIGHT_TWO_DAYS',
  '2-nights-3-days': 'TWO_NIGHTS_THREE_DAYS',
  '3-nights-4-days': 'THREE_NIGHTS_FOUR_DAYS',
  '4-nights-or-more': 'FOUR_NIGHTS_OR_MORE',
} as const;
const transportTypeByValue = { walking: 'WALK', car: 'CAR' } as const;
const companionTypeByValue = {
  solo: 'SOLO',
  friends: 'FRIEND',
  couple: 'COUPLE',
  family: 'FAMILY',
  children: 'CHILDREN',
} as const;

export function useVisitOrderSelection() {
  const [visitEvents, setVisitEvents] =
    useState<VisitEvent[]>(initialVisitEvents);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveEventId(String(active.id));
  const handleDragCancel = () => setActiveEventId(null);
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveEventId(null);
    if (!over || active.id === over.id) return;
    setVisitEvents((currentEvents) => {
      const activeIndex = currentEvents.findIndex(
        (event) => event.id === active.id
      );
      const overIndex = currentEvents.findIndex(
        (event) => event.id === over.id
      );
      return activeIndex < 0 || overIndex < 0
        ? currentEvents
        : arrayMove(currentEvents, activeIndex, overIndex);
    });
  };
  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = async (): Promise<number | null> => {
    setIsUploading(true);
    setUploadError('');
    try {
      const store = useLocalRecommendationStore.getState();
      const { draft, pendingImages } = store;
      if (!draft.basicInfo || !draft.neighborhood || !draft.coverImageKey) {
        throw new Error(
          '코스 기본 정보가 누락되었습니다. 이전 단계에서 다시 확인해 주세요.'
        );
      }
      const files = await Promise.all(
        draft.places.map(async (place) => {
          const pendingImage = pendingImages[place.id];
          if (!pendingImage)
            throw new Error(
              '장소 사진 정보를 찾을 수 없습니다. 사진을 다시 등록해 주세요.'
            );
          const compressedFile =
            pendingImage.compressedFile ??
            (await pendingImage.compressionPromise);
          return compressedFile ?? pendingImage.originalFile;
        })
      );
      const imageKeys = await uploadCourseImages(files);
      const places = draft.places.map((place, index) => ({
        ...place,
        imageKey: imageKeys[index],
      }));
      const orderById = new Map(
        visitEvents.map(({ id }, index) => [id, index + 1])
      );
      const courseItems: CourseItem[] = [
        ...places.map((place, index) => ({
          order: orderById.get(place.id) ?? index + 1,
          type: 'PLACE' as const,
          externalPlaceId: place.externalPlaceId,
          categoryGroupCode: place.categoryGroupCode,
          name: place.title,
          roadAddress: place.roadAddress,
          lotAddress: place.lotAddress,
          latitude: place.latitude,
          longitude: place.longitude,
          imageKey: place.imageKey,
        })),
      ].sort((left, right) => left.order - right.order);
      const { basicInfo } = draft;
      const payload: CreateLocalRecommendationRequest = {
        title: basicInfo.courseName,
        regionId: draft.neighborhood.id,
        description: basicInfo.summary,
        durationType: durationTypeByValue[basicInfo.duration],
        transportType: transportTypeByValue[basicInfo.transport],
        companionType: companionTypeByValue[basicInfo.companion],
        monthStart: Number(basicInfo.visitStartMonth),
        monthEnd: Number(basicInfo.visitEndMonth),
        thumbnailKey: draft.coverImageKey,
        hashtagIds: draft.hashtagIds,
        courseItems,
      };
      const result = await createLocalRecommendation(payload);
      store.setPlaces(places);
      store.setVisitOrder(visitEvents.map(({ id }) => id));
      store.resetDraft();
      return result.courseId;
    } catch (error) {
      console.error('[handleRegister] Course registration failed:', error);
      setUploadError(
        error instanceof Error
          ? error.message
          : '코스 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    isUploading,
    uploadError,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    handleRegister,
  };
}
