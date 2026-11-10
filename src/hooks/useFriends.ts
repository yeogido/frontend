import { useMemo } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { deleteFriend, getFriends } from '../apis/friends.api';
import { toFriendKeyword } from '../pages/friends/utils/friendKeyword';
import { useAuthStore } from '../store/auth.store';
import type { GetFriendsResponse } from '../types/friend.type';
import { getFriendsFromPages } from './utils/friendPages';
import { keepFriendsPlaceholderData } from './utils/friendPlaceholder';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

const FRIENDS_PAGE_SIZE = 10;

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const FRIENDS_QUERY_PREFIX = 'friends';

export const getFriendsQueryKey = (
  userId: number | null,
  keyword = ''
): [string, number | null, string] => [FRIENDS_QUERY_PREFIX, userId, keyword];

interface FriendsPageParam {
  cursorNickname?: string;
  cursorId?: number;
}

export function useFriends(keyword: string) {
  const userId = useAuthStore((state) => state.userId);
  const normalizedKeyword = toFriendKeyword(keyword);

  const query = useInfiniteQuery<
    GetFriendsResponse,
    Error,
    InfiniteData<GetFriendsResponse, FriendsPageParam>,
    [string, number | null, string],
    FriendsPageParam
  >({
    queryKey: getFriendsQueryKey(userId, normalizedKeyword),
    queryFn: ({ pageParam }) =>
      getFriends({
        keyword: normalizedKeyword,
        size: FRIENDS_PAGE_SIZE,
        ...pageParam,
      }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext &&
      lastPage.cursorId != null &&
      lastPage.cursorValue != null
        ? {
            cursorNickname: String(lastPage.cursorValue),
            cursorId: lastPage.cursorId,
          }
        : undefined,
    enabled: userId !== null,
    placeholderData: (previousData, previousQuery) =>
      keepFriendsPlaceholderData(previousData, previousQuery, userId),
    retry: shouldRetryFriendsQuery,
  });

  const friends = useMemo(
    () => getFriendsFromPages(query.data?.pages),
    [query.data?.pages]
  );

  return {
    friends,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
  };
}

export function useDeleteFriend() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation<void, Error, number>({
    mutationFn: (friendUserId) => deleteFriend(friendUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [FRIENDS_QUERY_PREFIX, userId],
      });
    },
  });
}
