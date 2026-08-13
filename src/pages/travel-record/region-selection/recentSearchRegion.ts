import { filterTravelMapSelectableRegions } from '../constants/travelRecordRegionCodes.ts';
import { mapRegionSearchToTravelRecordRegion } from '../mappers/travelRecordApiMapper.ts';

import type { RegionSearchResponse } from '../../../types/region.type';
import type { TravelRecordRegion } from './types';

export const findTravelRecordRegionByName = (
  regions: readonly TravelRecordRegion[],
  regionName: string,
) =>
  regions.find(
    (region) =>
      region.name === regionName ||
      region.province === regionName ||
      region.selectionName === regionName,
  );

/**
 * 최근 검색 칩에는 지역 이름만 저장돼 있다. 화면에 이미 올라와 있는 지역
 * 목록(인기 지역, 지금 입력한 검색어의 결과)에 그 이름이 없으면 어떤 지역인지
 * 알 수 없어 칩을 눌러도 아무 일도 일어나지 않으므로, 이름으로 다시 검색한
 * 결과에서 지역을 찾는다. 이름이 정확히 일치하는 후보가 없으면 그 키워드의
 * 첫 검색 결과를 지역으로 본다(예: '전주' → '전주시').
 */
export const resolveTravelRecordRegionFromSearch = (
  searchResults: readonly RegionSearchResponse[],
  regionName: string,
): TravelRecordRegion | undefined => {
  const candidates = filterTravelMapSelectableRegions(searchResults).map(
    mapRegionSearchToTravelRecordRegion,
  );

  return findTravelRecordRegionByName(candidates, regionName) ?? candidates[0];
};
