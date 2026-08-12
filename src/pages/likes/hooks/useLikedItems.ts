import { useInfiniteQuery } from '@tanstack/react-query';

import { getLikedItems } from '../../../apis/likes.api';
import type { LikedItemQueryCategory } from '../types';

interface UseLikedItemsParams {
  category: LikedItemQueryCategory;
  keyword?: string;
  sort: 'LATEST' | 'OLDEST';
  latitude?: number;
  longitude?: number;
  enabled?: boolean;
}

interface LikedItemsPageParam {
  cursorCreatedAt?: string;
  cursorId?: number;
}

export function useLikedItems({
  category,
  keyword,
  sort,
  latitude,
  longitude,
  enabled = true,
}: UseLikedItemsParams) {
  return useInfiniteQuery({
    queryKey: ['likedItems', { category, keyword, sort, latitude, longitude }],
    queryFn: ({ pageParam, signal }) =>
      getLikedItems(
        {
          category,
          keyword,
          sort,
          cursorCreatedAt: pageParam.cursorCreatedAt,
          cursorId: pageParam.cursorId,
          size: 10,
          latitude,
          longitude,
        },
        signal
      ),
    initialPageParam: {} as LikedItemsPageParam,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorValue && lastPage.cursorId !== null
        ? {
            cursorCreatedAt: lastPage.cursorValue,
            cursorId: lastPage.cursorId,
          }
        : undefined,
    enabled,
  });
}
