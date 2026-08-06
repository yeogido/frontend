import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getRegions } from '../../../apis/regions.api';
import { DEFAULT_CITY_ID, cityOptions as staticCityOptions } from '../constants/regions';
import type { CityOption } from '../types';

function useRegionOptions() {
  const regionsQuery = useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 5 * 60_000,
  });

  const cities = useMemo<readonly CityOption[]>(() => {
    const regionIdByName = new Map(
      regionsQuery.data?.regions.map((region) => [region.name, region.regionId])
    );

    return staticCityOptions.map((city) => ({
      ...city,
      regionId: regionIdByName.get(city.name),
    }));
  }, [regionsQuery.data]);

  return {
    cities,
    defaultCityId: DEFAULT_CITY_ID,
    isLoading: regionsQuery.isPending,
    isError: regionsQuery.isError,
  };
}

export default useRegionOptions;
