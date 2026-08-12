import { useCallback } from 'react';

import type { RegionCityId } from '../../../constants/regions';
import { REGION_IMAGE_ALL_ID } from '../../../components/common/RegionImageCarouselOption';
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
  selectedRegionId: RegionCityId | typeof REGION_IMAGE_ALL_ID;
}

function useLocalBusinesses({
  selectedCategory,
  sortBy,
  selectedRegionId,
}: UseLocalBusinessesParams) {
  const {
    data: regionsData,
    isPending: isRegionsPending,
    isError: isRegionsError,
  } = useRegions();
  const isNationwide = selectedRegionId === REGION_IMAGE_ALL_ID;
  const regionId = isNationwide
    ? undefined
    : resolveRegionId(selectedRegionId, regionsData?.regions);

  // 전국은 regionId가 필요 없으므로 /regions 응답을 기다리거나 그 실패에
  // 끌려가지 않는다. 그러지 않으면 지역 목록 조회가 실패했을 때 필터가
  // 필요 없는 전국 조회까지 막히고 에러 화면이 뜬다.
  const isRegionResolutionPending = !isNationwide && isRegionsPending;
  const isRegionResolutionError = !isNationwide && isRegionsError;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError: isBusinessPromotionsError,
    isFetchingNextPage,
    isPending: isBusinessPromotionsPending,
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
    { enabled: !isRegionResolutionPending && !isRegionResolutionError }
  );

  // 지역 조회가 실패하면 useBusinessPromotions는 영원히 enabled:false로
  // 남아 자체 isPending/isError가 갱신되지 않는다. 그 상태를 여기서
  // 지역 조회 실패로 덮어써서, 무한 로딩 대신 기존 에러 UI가 뜨게 한다.
  const isPending =
    isRegionResolutionPending ||
    (!isRegionResolutionError && isBusinessPromotionsPending);
  const isError = isRegionResolutionError || isBusinessPromotionsError;

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
