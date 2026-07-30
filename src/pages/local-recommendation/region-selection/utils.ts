import type {
  Region,
  RegionSearchResult,
  SubRegion,
} from '../../../types/region.type';
import type { Neighborhood } from './types';

export const fromRegion = (region: Region): Neighborhood => ({
  id: region.regionId,
  name: region.name,
  parentName: '',
});

export const fromSearchResult = (result: RegionSearchResult): Neighborhood => ({
  id: result.regionId,
  name: result.name,
  parentName: result.fullName.replace(new RegExp(`\\s*${result.name}$`), ''),
});

export const fromSubRegion = (
  subRegion: SubRegion,
  parentName: string
): Neighborhood => ({
  id: subRegion.subRegionId,
  name: subRegion.name,
  parentName,
});

export const getNeighborhoodLabel = (neighborhood: Neighborhood) =>
  [neighborhood.parentName, neighborhood.name].filter(Boolean).join(' ');
