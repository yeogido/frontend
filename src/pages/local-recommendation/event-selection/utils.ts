import { festivalAssetRegistry } from './constants/festivalAssetRegistry';
import { filterFestivalApiItems, normalizeFestivalTag } from './festivalSearch';
import type { FestivalApiItem, FestivalItem } from './types';

export { filterFestivalApiItems, normalizeFestivalTag };

export const mapFestivalApiItem = (
  festival: FestivalApiItem
): FestivalItem => ({
  ...festival,
  imageSrc: festivalAssetRegistry[normalizeFestivalTag(festival.tag)] ?? null,
});

export const filterFestivals = (
  festivals: readonly FestivalApiItem[],
  query: string
): FestivalItem[] =>
  filterFestivalApiItems(festivals, query).map(mapFestivalApiItem);
