import {
  type InfiniteData,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { getCultureContents } from '../apis/contents.api';
import type { GetCultureContentsParams } from '../types/content.type';
import type { GetCultureContentsResponse } from '../types/content.type';

interface CultureContentsPageParam {
  cursorValue?: string;
  cursorId?: number;
}

export function useCultureContents(
  params: GetCultureContentsParams = {},
) {
  return useInfiniteQuery<
    GetCultureContentsResponse,
    Error,
    InfiniteData<GetCultureContentsResponse>,
    [string, GetCultureContentsParams],
    CultureContentsPageParam
  >({
    queryKey: ['cultureContents', params],
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
  });
}
