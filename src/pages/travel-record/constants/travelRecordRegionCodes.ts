import { normalizeRegionName } from '../../../constants/regions.ts';

import type { Region } from '../../../types/region.type';

/**
 * 특별시·광역시 목록. 여행 지도는 광역시 산하 구를 따로 그리지 않아,
 * 구가 선택되면 상위 광역시로 올려서 저장한다.
 *
 * 여기에 상위 지역의 regionId를 적어 두면 안 된다. 백엔드가 지역 ID를
 * 재부여하면 조용히 어긋나고(2026-08-13에 실제로 발생: 광주가 옛 ID 54로
 * 저장돼 부산 수영구로 기록됐다), 화면에는 올바른 지역이 보여서 알아채기도
 * 어렵다. ID는 항상 GET /regions 응답에서 이름으로 찾는다.
 */
const METROPOLITAN_CITY_NAMES = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '광주광역시',
  '인천광역시',
  '대전광역시',
  '울산광역시',
] as const;

interface TravelMapRegionCandidate {
  fullName: string;
}

export const isTravelMapSelectableRegion = ({
  fullName,
}: TravelMapRegionCandidate) =>
  !METROPOLITAN_CITY_NAMES.some((metropolitanCityName) =>
    fullName.startsWith(`${metropolitanCityName} `),
  );

export const filterTravelMapSelectableRegions = <
  T extends TravelMapRegionCandidate,
>(
  regions: readonly T[],
) => regions.filter(isTravelMapSelectableRegion);

/** 선택된 지역이 속한 특별시·광역시의 정식 명칭. 아니면 undefined. */
const getMetropolitanCityName = (province: string) =>
  METROPOLITAN_CITY_NAMES.find(
    (cityName) => province === cityName || province.startsWith(`${cityName} `),
  );

/**
 * 광역시 산하 구 선택을 상위 광역시로 바꾼다.
 *
 * 상위 지역의 id는 GET /regions 목록에서 이름으로 찾는다. 목록이 아직
 * 없거나(로딩·조회 실패) 이름이 없으면 선택값을 그대로 둔다 — 추측한 id로
 * 저장하면 엉뚱한 지역에 기록이 남는다.
 */
export const normalizeTravelMapSelectedRegion = <
  T extends {
    id: string;
    regionId?: number;
    name: string;
    province: string;
    selectionName: string;
  },
>(
  region: T,
  topLevelRegions: readonly Region[] = [],
) => {
  const cityName = getMetropolitanCityName(region.province);

  if (!cityName || region.province === cityName) {
    return region;
  }

  // GET /regions의 name은 축약형('부산')이고 province는 정식 명칭이다.
  const shortName = normalizeRegionName(cityName);
  const parentRegion = topLevelRegions.find(
    (topLevelRegion) => topLevelRegion.name === shortName,
  );

  if (!parentRegion) {
    return region;
  }

  return {
    ...region,
    id: String(parentRegion.regionId),
    regionId: parentRegion.regionId,
    name: parentRegion.name,
    province: cityName,
    selectionName: parentRegion.name,
  };
};
