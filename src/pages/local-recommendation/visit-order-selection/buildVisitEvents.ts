import type {
  PersistedSelectedPlace,
  PersistedSelectedFestival,
} from '../../../store/localRecommendation.store';
import type { VisitEvent } from './constants';

export function buildVisitEvents(
  places: readonly PersistedSelectedPlace[],
  festivals: readonly PersistedSelectedFestival[],
  visitOrder: readonly string[],
  fallbackImageSrc: string,
  placeImageSrcById: ReadonlyMap<string, string> = new Map()
): VisitEvent[] {
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
