import type { FestivalItem } from '../../../local-recommendation/event-selection/types';
import type { VisitEvent } from '../../../local-recommendation/visit-order-selection/constants';
import type { AdminCoursePlaceItem } from '../types';
import {
  VISIT_EVENT_CONTENT_ID_PREFIX,
  VISIT_EVENT_PLACE_ID_PREFIX,
} from '../types';

export function buildAdminVisitEvents(
  places: readonly AdminCoursePlaceItem[],
  events: readonly FestivalItem[],
  fallbackImageSrc: string,
  // 스토어에 저장된 이전 방문 순서(id 목록). 순서를 매기는 용도로만 쓰고,
  // 실제 항목 데이터는 항상 현재 selectedPlaces/selectedEvents로 새로
  // 만든다 — 그래야 뒤로 가서 항목을 빼거나 추가해도 반영된다.
  visitOrder: readonly string[] = []
): VisitEvent[] {
  const placeEvents: VisitEvent[] = places.map((place) => ({
    id: `${VISIT_EVENT_PLACE_ID_PREFIX}${place.id}`,
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
    imageKey: place.existingImageKey ?? null,
  }));

  const contentEvents: VisitEvent[] = events.map((event) => ({
    id: `${VISIT_EVENT_CONTENT_ID_PREFIX}${event.id}`,
    kind: 'CONTENT',
    name: event.title,
    address: event.address,
    imageSrc: event.imageSrc ?? fallbackImageSrc,
    contentId: event.contentId,
  }));

  const combined = [...placeEvents, ...contentEvents];

  if (visitOrder.length === 0) {
    return combined;
  }

  const byId = new Map(combined.map((event) => [event.id, event]));
  const ordered = visitOrder.flatMap((id) => {
    const event = byId.get(id);
    return event ? [event] : [];
  });
  const orderedIds = new Set(ordered.map((event) => event.id));
  const remaining = combined.filter((event) => !orderedIds.has(event.id));

  return [...ordered, ...remaining];
}
