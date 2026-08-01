import type { Region, RegionSearchResult } from '../../../types/region.type';
import type { Neighborhood } from './types';

export const fromRegion = (region: Region): Neighborhood => ({
  id: region.regionId,
  name: region.name,
  parentName: '',
});

export const fromSearchResult = (result: RegionSearchResult): Neighborhood => {
  const { fullName, name } = result;
  const parentName = fullName.endsWith(name)
    ? fullName.slice(0, fullName.length - name.length).trimEnd()
    : fullName;

  return { id: result.regionId, name, parentName };
};

export const getNeighborhoodLabel = (neighborhood: Neighborhood) =>
  [neighborhood.parentName, neighborhood.name].filter(Boolean).join(' ');
