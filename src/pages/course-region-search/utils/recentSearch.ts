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

/**
 * "서울 맛집"처럼 시/도 이름으로 시작하기만 한 자유 검색어를 지역 필터로
 * 바꾸면 keyword가 사라져 빈 지역 결과가 나온다. 뒤 토큰이 그 시/도의 실제
 * 하위 지역과 정확히 일치할 때만 지역 경로로 인정하고, 아니면 호출부가
 * 키워드 검색을 유지하게 한다.
 */
export const isKnownRegionPath = (
  district: string | undefined,
  subRegionNames: readonly string[]
) => district === undefined || subRegionNames.includes(district);
