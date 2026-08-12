export const getAllRegionRecentSearch = (
  cityName: string,
  parentRegionName?: string
) => parentRegionName ?? cityName;

export const getSubRegionRecentSearch = (
  cityName: string,
  parentRegionNames: readonly string[],
  districtName: string
) => [cityName, ...parentRegionNames, districtName].join(' ');

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
