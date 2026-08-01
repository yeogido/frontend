const METROPOLITAN_CITY_NAMES = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
] as const;

const METROPOLITAN_CITY_PARENT_REGIONS = {
  서울특별시: { regionId: 1, name: '서울', fullName: '서울특별시' },
  부산광역시: { regionId: 27, name: '부산', fullName: '부산광역시' },
  대구광역시: { regionId: 44, name: '대구', fullName: '대구광역시' },
  광주광역시: { regionId: 54, name: '광주', fullName: '광주광역시' },
  인천광역시: { regionId: 60, name: '인천', fullName: '인천광역시' },
  대전광역시: { regionId: 72, name: '대전', fullName: '대전광역시' },
} as const;

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

const getMetropolitanCityParent = (fullName: string) =>
  Object.entries(METROPOLITAN_CITY_PARENT_REGIONS).find(
    ([metropolitanCityName]) =>
      fullName === metropolitanCityName ||
      fullName.startsWith(`${metropolitanCityName} `),
  )?.[1];

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
