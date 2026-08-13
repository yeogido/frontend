import type {
  PopularRegionResponse,
  RegionSearchResult,
} from '../../../types/region.type';
import type { Neighborhood } from './types';

const deriveParentName = (name: string, fullName: string): string =>
  fullName.endsWith(name)
    ? fullName.slice(0, fullName.length - name.length).trimEnd()
    : fullName;

export const fromRegion = (region: PopularRegionResponse): Neighborhood => ({
  id: region.regionId,
  name: region.name,
  parentName: deriveParentName(region.name, region.fullName),
});

export const fromSearchResult = (result: RegionSearchResult): Neighborhood => ({
  id: result.regionId,
  name: result.name,
  parentName: deriveParentName(result.name, result.fullName),
});

export const getNeighborhoodLabel = (neighborhood: Neighborhood) =>
  [neighborhood.parentName, neighborhood.name].filter(Boolean).join(' ');

const normalizeRegionSearchText = (value: string) =>
  value.replaceAll(/\s/g, '').toLocaleLowerCase('ko-KR');

const getNeighborhoodRelevance = (neighborhood: Neighborhood, query: string) => {
  const normalizedQuery = normalizeRegionSearchText(query);
  const normalizedLabel = normalizeRegionSearchText(
    getNeighborhoodLabel(neighborhood),
  );
  const normalizedName = normalizeRegionSearchText(neighborhood.name);

  if (normalizedLabel === normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 1;
  if (normalizedLabel.startsWith(normalizedQuery)) return 2;
  if (normalizedName.startsWith(normalizedQuery)) return 3;
  if (normalizedLabel.includes(normalizedQuery)) return 4;

  return 5;
};

export const sortNeighborhoodsByRelevance = (
  neighborhoods: readonly Neighborhood[],
  query: string,
) =>
  neighborhoods
    .map((neighborhood, index) => ({
      neighborhood,
      index,
      relevance: getNeighborhoodRelevance(neighborhood, query),
      labelLength: normalizeRegionSearchText(
        getNeighborhoodLabel(neighborhood),
      ).length,
    }))
    .sort(
      (left, right) =>
        left.relevance - right.relevance ||
        left.labelLength - right.labelLength ||
        left.index - right.index,
    )
    .map(({ neighborhood }) => neighborhood);

export const toRegionSearchSuggestions = (
  neighborhoods: readonly Neighborhood[],
) =>
  neighborhoods.map((neighborhood) => ({
    label: getNeighborhoodLabel(neighborhood),
    regionId: neighborhood.id,
  }));
