import { useMemo } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  acceptFriendRequest,
  cancelFriendRequest,
  getReceivedFriendRequests,
  getSentFriendRequests,
  rejectFriendRequest,
} from '../apis/friends.api';
import type { CursorResponse } from '../apis/common/apiTypes';
import { useAuthStore } from '../store/auth.store';
import type {
  AcceptFriendRequestResult,
  GetFriendRequestsParams,
  ReceivedFriendRequest,
  SentFriendRequest,
} from '../types/friend.type';
import { invalidateFriendTravelQueries } from './friendQueryKeys';
import { FRIEND_PROFILE_QUERY_PREFIX } from './useFriendProfile';
import { FRIEND_SEARCH_QUERY_PREFIX } from './useFriendSearch';
import { FRIENDS_QUERY_PREFIX } from './useFriends';
import {
  getRequestsFromPages,
  removeRequestFromData,
} from './utils/friendRequestPages';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

// 서버 기본값과 같다. 받은 요청은 화면에서 끝까지 이어 받고, 보낸 요청은
// 첫 페이지만 보여 준 뒤 "더 보기"로 이어 받는다.
const FRIEND_REQUESTS_PAGE_SIZE = 10;

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const FRIEND_REQUESTS_QUERY_PREFIX = 'friendRequests';

type FriendRequestKind = 'received' | 'sent';
type FriendRequestsQueryKey = [string, FriendRequestKind, number | null];

export const getFriendRequestsQueryKey = (
  kind: FriendRequestKind,
  userId: number | null
): FriendRequestsQueryKey => [FRIEND_REQUESTS_QUERY_PREFIX, kind, userId];

interface FriendRequestsPageParam {
  cursorId?: number;
}

type FriendRequestsData<TItem> = InfiniteData<
  CursorResponse<TItem>,
  FriendRequestsPageParam
>;

function useFriendRequestsQuery<TItem extends { requestId: number }>(
  kind: FriendRequestKind,
  fetchPage: (params: GetFriendRequestsParams) => Promise<CursorResponse<TItem>>
) {
  const userId = useAuthStore((state) => state.userId);

  const query = useInfiniteQuery<
    CursorResponse<TItem>,
    Error,
    FriendRequestsData<TItem>,
    FriendRequestsQueryKey,
    FriendRequestsPageParam
  >({
    queryKey: getFriendRequestsQueryKey(kind, userId),
    queryFn: ({ pageParam }) =>
      fetchPage({ size: FRIEND_REQUESTS_PAGE_SIZE, ...pageParam }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId != null
        ? { cursorId: lastPage.cursorId }
        : undefined,
    enabled: userId !== null,
    retry: shouldRetryFriendsQuery,
  });

  const requests = useMemo(
    () => getRequestsFromPages(query.data?.pages),
    [query.data?.pages]
  );

  return {
    requests,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    isRefetchError: query.isRefetchError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
  };
}

export function useReceivedFriendRequests() {
  return useFriendRequestsQuery<ReceivedFriendRequest>(
    'received',
    getReceivedFriendRequests
  );
}

export function useSentFriendRequests() {
  return useFriendRequestsQuery<SentFriendRequest>(
    'sent',
    getSentFriendRequests
  );
}

// 처리에 성공했거나 이미 처리된 요청은 목록을 다시 받지 않고 캐시에서 바로 뺀다.
// 진행 중인 조회가 있으면 먼저 취소한다. 그대로 두면 처리 전에 시작된 조회의
// 응답이 뒤늦게 도착해 방금 뺀 행을 다시 채울 수 있다.
export function useRemoveFriendRequestFromCache() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return async (kind: FriendRequestKind, requestId: number) => {
    const queryKey = getFriendRequestsQueryKey(kind, userId);

    await queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<FriendRequestsData<{ requestId: number }>>(
      queryKey,
      (data) => removeRequestFromData(data, requestId)
    );
  };
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const removeFromCache = useRemoveFriendRequestFromCache();

  return useMutation<AcceptFriendRequestResult, Error, number>({
    mutationFn: acceptFriendRequest,
    onSuccess: async (result, requestId) => {
      await removeFromCache('received', requestId);
      // 새 친구가 목록에 보이고, 받은 요청이 서버 상태와 맞도록 다시 받는다.
      void queryClient.invalidateQueries({
        queryKey: [FRIENDS_QUERY_PREFIX, userId],
      });
      void queryClient.invalidateQueries({
        queryKey: [FRIEND_SEARCH_QUERY_PREFIX, userId],
      });
      void queryClient.invalidateQueries({
        queryKey: [FRIEND_PROFILE_QUERY_PREFIX, userId],
      });
      // 친구가 되면 블러 항목 등 친구에게만 내려오는 여행 데이터가 달라진다.
      invalidateFriendTravelQueries(queryClient, userId, result.friend.userId);
      void queryClient.invalidateQueries({
        queryKey: getFriendRequestsQueryKey('received', userId),
      });
    },
  });
}

export function useRejectFriendRequest() {
  const removeFromCache = useRemoveFriendRequestFromCache();

  return useMutation<void, Error, number>({
    mutationFn: rejectFriendRequest,
    onSuccess: (_result, requestId) => removeFromCache('received', requestId),
  });
}

export function useCancelFriendRequest() {
  const removeFromCache = useRemoveFriendRequestFromCache();

  return useMutation<void, Error, number>({
    mutationFn: cancelFriendRequest,
    onSuccess: (_result, requestId) => removeFromCache('sent', requestId),
  });
}
