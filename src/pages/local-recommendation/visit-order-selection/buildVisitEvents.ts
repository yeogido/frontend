import type {
  PersistedSelectedPlace,
  PersistedSelectedFestival,
} from '../../../store/localRecommendation.store';
import type { VisitEvent } from './constants';

/**
 * 일차별 방문 일정을 만든다. 일차 배정의 기준은 visitOrder(일차별 ID 배열)이며,
 * 거기에 없는 항목은 1일차 끝에 붙인다 — 일차 개념이 없던 시절의 draft나
 * 선택 화면에서 순서가 기록되기 전의 항목을 잃지 않기 위해서다.
 *
 * 반환 배열의 길이는 항상 totalDays다(일정이 비어 있는 일차도 자리를 지킨다).
 */
export function buildVisitEvents(
  places: readonly PersistedSelectedPlace[],
  festivals: readonly PersistedSelectedFestival[],
  visitOrder: readonly (readonly string[])[],
  fallbackImageSrc: string,
  placeImageSrcById: ReadonlyMap<string, string> = new Map(),
  totalDays = 1
): VisitEvent[][] {
  const placeEvents: VisitEvent[] = places.map((place) => ({
    id: place.id,
    kind: 'PLACE',
    name: place.title,
    address: place.address,
    imageSrc: placeImageSrcById.get(place.id) ?? fallbackImageSrc,
    externalPlaceId: place.externalPlaceId,
    categoryGroupCode: place.categoryGroupCode,
    roadAddress: place.roadAddress,
    lotAddress: place.lotAddress,
    latitude: place.latitude,
    longitude: place.longitude,
    imageKey: place.imageKey,
  }));

  const festivalEvents: VisitEvent[] = festivals.map((festival) => ({
    id: festival.id,
    kind: 'CONTENT',
    name: festival.title,
    address: festival.address,
    imageSrc: festival.imageSrc ?? fallbackImageSrc,
    contentId: festival.contentId,
  }));

  const combined = [...placeEvents, ...festivalEvents];
  const byId = new Map(combined.map((event) => [event.id, event]));
  const dayCount = Math.max(totalDays, visitOrder.length, 1);

  const ordered: VisitEvent[][] = Array.from({ length: dayCount }, (_, day) =>
    (visitOrder[day] ?? []).flatMap((id) => {
      const event = byId.get(id);
      return event ? [event] : [];
    })
  );

  const placedIds = new Set(ordered.flat().map((event) => event.id));
  const remaining = combined.filter((event) => !placedIds.has(event.id));
  ordered[0] = [...ordered[0], ...remaining];

  return ordered;
}
