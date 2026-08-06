import { useInfiniteQuery } from '@tanstack/react-query';

import { getLikedItems } from '../../../apis/likes.api';
import type { LikedItemQueryCategory } from '../types';

interface UseLikedItemsParams {
  category: LikedItemQueryCategory;
  keyword?: string;
  sort: 'LATEST' | 'OLDEST';
}

interface LikedItemsPageParam {
  cursorCreatedAt?: string;
  cursorId?: number;
}

export function useLikedItems({
  category,
  keyword,
  sort,
}: UseLikedItemsParams) {
  return useInfiniteQuery({
    queryKey: ['likedItems', { category, keyword, sort }],
    queryFn: ({ pageParam, signal }) =>
      getLikedItems(
        {
          category,
          keyword,
          sort,
          cursorCreatedAt: pageParam.cursorCreatedAt,
          cursorId: pageParam.cursorId,
          size: 10,
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
  });
}
