import { regionCities } from '../../../../constants/regions';
import { regionCityImages } from '../../../../constants/regionImages';
import type { PopularRegionResponse } from '../../../../types/region.type';

// UI만 구현하는 화면이라 실제 /regions API 대신 로컬 정적 데이터를 쓴다.
export const mockPopularRegions: PopularRegionResponse[] = regionCities.map(
  (city, index) => ({
    regionId: index + 1,
    name: city.name,
    fullName: city.name,
    imageUrl: regionCityImages[city.id],
  })
);

export function searchMockRegions(keyword: string): PopularRegionResponse[] {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return [];
  }

  return mockPopularRegions.filter((region) => region.name.includes(trimmed));
}
