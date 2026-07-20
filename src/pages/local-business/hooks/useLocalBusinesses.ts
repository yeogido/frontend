import { useMemo } from 'react';

import {createLocalBusinessItems} from '../../../apis/localBusiness';
import type { BusinessCategory, BusinessSort } from '../types';

interface UseLocalBusinessesParams {
  selectedCategory: BusinessCategory;
  sortBy: BusinessSort;
}

function useLocalBusinesses({
  selectedCategory,
  sortBy,
}: UseLocalBusinessesParams) {
  const businesses = useMemo(
    () =>
      createLocalBusinessItems({
        category: selectedCategory,
        sortBy,
      }),
    [selectedCategory, sortBy],
  );

  return businesses;
}

export default useLocalBusinesses;
