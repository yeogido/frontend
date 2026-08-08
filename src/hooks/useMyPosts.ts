import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { getMyPosts } from '../apis/users.api';
import type { GetMyPostsResponse, MyPostCategory } from '../types/user.type';

const MY_POSTS_PAGE_SIZE = 10;

interface MyPostsPageParam {
  cursorCreatedAt?: string;
  cursorId?: number;
}

export function useMyPosts(
  category: MyPostCategory,
  sort: 'LATEST' | 'OLDEST',
  keyword: string
) {
  return useInfiniteQuery<
    GetMyPostsResponse,
    Error,
    InfiniteData<GetMyPostsResponse, MyPostsPageParam>,
    [string, MyPostCategory, 'LATEST' | 'OLDEST', string],
    MyPostsPageParam
  >({
    queryKey: ['myPosts', category, sort, keyword],
    queryFn: ({ pageParam }) =>
      getMyPosts({
        category,
        sort,
        size: MY_POSTS_PAGE_SIZE,
        keyword: keyword.trim() || undefined,
        ...pageParam,
      }),
    initialPageParam: {},
    // cursorValue와 cursorId는 반드시 함께 보내야 한다(코스 후기 목록과 같은 규칙).
    getNextPageParam: (lastPage) =>
      lastPage.hasNext &&
      lastPage.cursorId !== null &&
      lastPage.cursorValue !== null
        ? {
            cursorCreatedAt: String(lastPage.cursorValue),
            cursorId: lastPage.cursorId,
          }
        : undefined,
  });
}

export const getMyPostsFromPages = (pages: GetMyPostsResponse[] | undefined) =>
  pages?.flatMap((page) => page.items) ?? [];
