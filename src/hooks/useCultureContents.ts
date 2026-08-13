import {
  type InfiniteData,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { getCultureContents } from '../apis/contents.api';
import { useAuthStore } from '../store/auth.store';
import type { GetCultureContentsParams } from '../types/content.type';
import type { GetCultureContentsResponse } from '../types/content.type';

interface CultureContentsPageParam {
  cursorValue?: string;
  cursorId?: number;
}

export function useCultureContents(
  params: GetCultureContentsParams = {},
  options?: { enabled?: boolean },
) {
  const authGeneration = useAuthStore((state) => state.authGeneration);

  return useInfiniteQuery<
    GetCultureContentsResponse,
    Error,
    InfiniteData<GetCultureContentsResponse, CultureContentsPageParam>,
    [string, number, GetCultureContentsParams],
    CultureContentsPageParam
  >({
    queryKey: ['cultureContents', authGeneration, params],
    queryFn: ({ pageParam }) =>
      getCultureContents({
        ...params,
        cursorValue: pageParam.cursorValue,
        cursorId: pageParam.cursorId,
      }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext
        ? {
            cursorValue: lastPage.cursorValue,
            cursorId: lastPage.cursorId,
          }
        : undefined,
    enabled: options?.enabled,
  });
}
