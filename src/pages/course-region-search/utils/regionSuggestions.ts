import type { CityOption } from '../types';

export const createRegionSearchSuggestions = (
  cities: readonly CityOption[]
) =>
  cities.flatMap((city) =>
    city.districts.flatMap((district) => {
      if (district.name === '전체') {
        return [];
      }

      const districtSuggestion = `${city.name} ${district.name}`;
      const subDistrictSuggestions =
        district.subDistricts
          ?.filter((subDistrict) => subDistrict !== '전체')
          .map(
            (subDistrict) => `${city.name} ${district.name} ${subDistrict}`
          ) ?? [];

      return [districtSuggestion, ...subDistrictSuggestions];
    })
  );
