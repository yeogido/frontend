import type { RegionSearchResult } from '../types/region.type';

export const getRegionSearchKeyword = (regionPath: string) =>
  regionPath.trim().split(/\s+/).at(-1) ?? regionPath;

export const findRegionSearchMatch = (
  keyword: string,
  regions: readonly RegionSearchResult[]
) => {
  const regionSearchKeyword = getRegionSearchKeyword(keyword);

  return regions.find(
    (region) =>
      region.name === keyword ||
      region.fullName === keyword ||
      region.name === regionSearchKeyword
  );
};
