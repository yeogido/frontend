import type { PlaceItem } from './types';

export const normalizePlaceQuery = (query: string) =>
  query.replace(/\s+/g, '').toLocaleLowerCase('ko-KR');

export const filterPlaceItems = (
  places: readonly PlaceItem[],
  query: string
): PlaceItem[] => {
  const normalizedQuery = normalizePlaceQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  return places.filter((place) =>
    [place.title, place.address]
      .map(normalizePlaceQuery)
      .some((field) => field.includes(normalizedQuery))
  );
};
