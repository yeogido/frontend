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
