import { useMemo } from 'react';

import { DEFAULT_CITY_ID, cityOptions } from '../constants/regions';

function useRegionOptions() {
  return useMemo(
    () => ({
      cities: cityOptions,
      defaultCityId: DEFAULT_CITY_ID,
      isLoading: false,
      isError: false,
    }),
    []
  );
}

export default useRegionOptions;
