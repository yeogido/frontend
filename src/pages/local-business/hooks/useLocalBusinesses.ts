import { useCallback } from 'react';

import type { RegionCityId } from '../../../constants/regions';
import { useBusinessPromotions } from '../../../hooks/useBusinessPromotions';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useRegions } from '../../../hooks/useRegions';
import {
  mapBusinessCategoryToApiParam,
  mapBusinessPromotionItemToBusinessItem,
  mapBusinessSortToApiParam,
  resolveRegionId,
} from '../mappers/businessPromotionMapper';
import type { BusinessCategory, BusinessSort } from '../types';

const PAGE_SIZE = 10;

interface UseLocalBusinessesParams {
  selectedCategory: BusinessCategory;
  sortBy: BusinessSort;
  selectedRegionId: RegionCityId;
}

function useLocalBusinesses({
  selectedCategory,
  sortBy,
  selectedRegionId,
}: UseLocalBusinessesParams) {
  const { data: regionsData, isPending: isRegionsPending } = useRegions();
  const regionId = resolveRegionId(selectedRegionId, regionsData?.regions);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useBusinessPromotions(
    {
      category:
        selectedCategory === '전체'
          ? undefined
          : mapBusinessCategoryToApiParam(selectedCategory),
      sort: mapBusinessSortToApiParam(sortBy),
      size: PAGE_SIZE,
      regionId,
    },
    { enabled: !isRegionsPending }
  );

  const businesses = (data?.pages.flatMap((page) => page.items) ?? []).map(
    mapBusinessPromotionItemToBusinessItem
  );

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  return {
    businesses,
    error,
    isError,
    isFetchingNextPage,
    isPending,
    loadMoreRef,
  };
}

export default useLocalBusinesses;
