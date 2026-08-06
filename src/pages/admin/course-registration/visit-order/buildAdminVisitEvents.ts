import type { VisitEvent } from '../../../local-recommendation/visit-order-selection/constants';
import type { AdminCourseEventItem, AdminCoursePlaceItem } from '../types';

export function buildAdminVisitEvents(
  places: readonly AdminCoursePlaceItem[],
  events: readonly AdminCourseEventItem[],
  fallbackImageSrc: string
): VisitEvent[] {
  const placeEvents: VisitEvent[] = places.map((place) => ({
    id: place.id,
    kind: 'PLACE',
    name: place.title,
    address: place.address,
    imageSrc: place.photoPreviewUrl ?? place.imageSrc ?? fallbackImageSrc,
    externalPlaceId: place.externalPlaceId,
    categoryGroupCode: place.categoryGroupCode,
    roadAddress: place.roadAddress,
    lotAddress: place.lotAddress,
    latitude: place.latitude,
    longitude: place.longitude,
    imageKey: null,
  }));

  const contentEvents: VisitEvent[] = events.map((event, index) => ({
    id: event.id,
    kind: 'CONTENT',
    name: event.title,
    address: event.address,
    imageSrc: event.imageSrc ?? fallbackImageSrc,
    // Mock 행사에는 실제 contentId가 없다 — API 연동 전까지만 쓰는 채움값이다.
    contentId: -(index + 1),
  }));

  return [...placeEvents, ...contentEvents];
}
