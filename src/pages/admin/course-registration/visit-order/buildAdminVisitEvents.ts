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
  visitOrder: readonly (readonly string[])[] = [],
  totalDays = 1
): VisitEvent[][] {
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
  const byId = new Map(combined.map((event) => [event.id, event]));
  const dayCount = Math.max(totalDays, visitOrder.length, 1);

  const ordered: VisitEvent[][] = Array.from({ length: dayCount }, (_, day) =>
    (visitOrder[day] ?? []).flatMap((id) => {
      const event = byId.get(id);
      return event ? [event] : [];
    })
  );

  // 아직 일차가 정해지지 않은 항목(뒤로 가서 새로 추가한 장소 등)은 1일차에 붙인다.
  const placedIds = new Set(ordered.flat().map((event) => event.id));
  ordered[0] = [
    ...ordered[0],
    ...combined.filter((event) => !placedIds.has(event.id)),
  ];

  return ordered;
}
