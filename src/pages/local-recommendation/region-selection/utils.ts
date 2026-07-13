import type { Neighborhood } from './types';

const normalizeSearchText = (text: string) =>
  text.replace(/\s/g, '').toLowerCase();

export const getNeighborhoodLabel = (neighborhood: Neighborhood) =>
  `${neighborhood.province} ${neighborhood.city} ${neighborhood.district}`;

export const filterNeighborhoods = (
  neighborhoods: Neighborhood[],
  query: string
) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  return neighborhoods.filter((neighborhood) =>
    normalizeSearchText(getNeighborhoodLabel(neighborhood)).includes(
      normalizedQuery
    )
  );
};
