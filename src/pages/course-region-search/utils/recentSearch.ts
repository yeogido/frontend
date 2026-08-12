// 지역 API가 시/도 → 시·군·구 2단계뿐이라 최근 검색어도 두 토큰까지만 만든다.
export const getSubRegionRecentSearch = (
  cityName: string,
  districtName: string
) => `${cityName} ${districtName}`;

interface CityNameOption {
  name: string;
}

export const getRecentSearchLocation = <T extends CityNameOption>(
  keyword: string,
  cities: readonly T[]
) => {
  const city = cities.find(
    (option) => keyword === option.name || keyword.startsWith(`${option.name} `)
  );

  if (!city) {
    return undefined;
  }

  const district = keyword.slice(city.name.length).trim();

  return {
    city,
    district: district || undefined,
  };
};
