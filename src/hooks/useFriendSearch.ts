import { useMemo } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { searchFriends } from '../apis/friends.api';
import { toFriendKeyword } from '../pages/friends/utils/friendKeyword';
import { useAuthStore } from '../store/auth.store';
import type { SearchFriendsResponse } from '../types/friend.type';
import { keepFriendsPlaceholderData } from './utils/friendPlaceholder';
import { shouldRetryFriendsQuery } from './utils/friendRetry';
import {
  getSearchItemsFromPages,
  type SearchRelationPatch,
  updateSearchItemRelation,
} from './utils/friendSearchPages';

// 서버 기본값과 같다. 정확히 일치한 사용자만 오므로 보통 첫 페이지로 끝난다.
const FRIEND_SEARCH_PAGE_SIZE = 10;

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const FRIEND_SEARCH_QUERY_PREFIX = 'friendSearch';

export const getFriendSearchQueryKey = (
  userId: number | null,
  keyword = ''
): [string, number | null, string] => [
  FRIEND_SEARCH_QUERY_PREFIX,
  userId,
  keyword,
];

interface FriendSearchPageParam {
  cursorId?: number;
}

type FriendSearchData = InfiniteData<
  SearchFriendsResponse,
  FriendSearchPageParam
>;

/** 내 친구가 아닌 사용자를 이름이나 친구 코드로 찾는다. 검색어가 비면 받지 않는다. */
export function useFriendSearch(keyword: string) {
  const userId = useAuthStore((state) => state.userId);
  const normalizedKeyword = toFriendKeyword(keyword);

  const query = useInfiniteQuery<
    SearchFriendsResponse,
    Error,
    FriendSearchData,
    [string, number | null, string],
    FriendSearchPageParam
  >({
    queryKey: getFriendSearchQueryKey(userId, normalizedKeyword),
    queryFn: ({ pageParam }) =>
      searchFriends({
        keyword: normalizedKeyword ?? '',
        size: FRIEND_SEARCH_PAGE_SIZE,
        ...pageParam,
      }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId != null
        ? { cursorId: lastPage.cursorId }
        : undefined,
    enabled: userId !== null && normalizedKeyword !== undefined,
    placeholderData: (previousData, previousQuery) =>
      keepFriendsPlaceholderData(previousData, previousQuery, userId),
    retry: shouldRetryFriendsQuery,
  });

  const items = useMemo(
    () => getSearchItemsFromPages(query.data?.pages),
    [query.data?.pages]
  );

  return {
    items,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
  };
}

/** 검색 결과 캐시를 계정 단위로 갱신한다. 검색어가 달라도 같은 사용자를 모두 바꾼다. */
export function useFriendSearchCache() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const queryKey = [FRIEND_SEARCH_QUERY_PREFIX, userId];

  return {
    // 진행 중인 조회를 먼저 취소한다. 그대로 두면 바뀌기 전에 시작된 조회의
    // 응답이 뒤늦게 도착해 방금 바꾼 상태를 되돌릴 수 있다.
    patchItem: async (targetUserId: number, patch: SearchRelationPatch) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueriesData<FriendSearchData>({ queryKey }, (data) =>
        updateSearchItemRelation(data, targetUserId, patch)
      );
    },
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  };
}
