import type { FestivalApiItem } from './types.ts';

export const normalizeFestivalTag = (tag: string) =>
  tag.trim().toLocaleLowerCase('ko-KR');

export const filterFestivalApiItems = (
  festivals: readonly FestivalApiItem[],
  query: string
): FestivalApiItem[] => {
  const normalizedQuery = normalizeFestivalTag(query);

  if (!normalizedQuery) {
    return [];
  }

  return festivals.filter((festival) =>
    [festival.tag, festival.title, festival.address]
      .map(normalizeFestivalTag)
      .some((field) => field.includes(normalizedQuery))
  );
};
