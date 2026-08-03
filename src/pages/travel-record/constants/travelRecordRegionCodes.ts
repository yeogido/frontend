interface MetropolitanCity {
  /**
   * Region API의 상위 지역 id.
   *
   * null이면 Region API에 아직 해당 지역이 등록되지 않아 상위 지역으로
   * 변환할 수 없다는 뜻이다. 하위 구는 그래도 검색 결과에서 제외되므로,
   * 백엔드에 지역이 추가되면 여기에 id만 채우면 된다.
   */
  regionId: number | null;
  name: string;
}

/**
 * 특별시·광역시 목록과 Region API 상위 지역 매핑을 한곳에서 관리한다.
 * 목록을 따로 두면 한쪽에만 지역이 추가되어 조용히 어긋날 수 있다.
 */
const METROPOLITAN_CITIES: Record<string, MetropolitanCity> = {
  서울특별시: { regionId: 1, name: '서울' },
  부산광역시: { regionId: 27, name: '부산' },
  대구광역시: { regionId: 44, name: '대구' },
  광주광역시: { regionId: 54, name: '광주' },
  인천광역시: { regionId: 60, name: '인천' },
  대전광역시: { regionId: 72, name: '대전' },
  울산광역시: { regionId: null, name: '울산' },
};

const METROPOLITAN_CITY_NAMES = Object.keys(METROPOLITAN_CITIES);

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

const getMetropolitanCityParent = (fullName: string) => {
  for (const [cityName, city] of Object.entries(METROPOLITAN_CITIES)) {
    if (fullName !== cityName && !fullName.startsWith(`${cityName} `)) {
      continue;
    }

    // Region API에 상위 지역이 없으면 변환하지 않고 선택값을 그대로 둔다.
    if (city.regionId === null) {
      return null;
    }

    return { regionId: city.regionId, name: city.name, fullName: cityName };
  }

  return null;
};

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
) => {
  const parentRegion = getMetropolitanCityParent(region.province);

  if (!parentRegion) {
    return region;
  }

  return {
    ...region,
    id: String(parentRegion.regionId),
    regionId: parentRegion.regionId,
    name: parentRegion.name,
    province: parentRegion.fullName,
    selectionName: parentRegion.name,
  };
};
