import { useMemo } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import {
  getFriendTravelRecords,
  getFriendTravelRecordYears,
} from '../apis/friends.api';
import { useAuthStore } from '../store/auth.store';
import type { GetFriendTravelRecordsResponse } from '../types/friend.type';
import {
  FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX,
  FRIEND_TRAVEL_RECORDS_QUERY_PREFIX,
} from './friendQueryKeys';
import { shouldRetryFriendsQuery } from './utils/friendRetry';
import {
  getFriendRecordYearOptions,
  getFriendTravelRecordsFromPages,
} from './utils/friendTravelRecordPages';

const FRIEND_TRAVEL_RECORDS_PAGE_SIZE = 20;

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const getFriendTravelRecordsQueryKey = (
  viewerUserId: number | null,
  friendUserId: number | null,
  year: number | null
): [string, number | null, number | null, number | null] => [
  FRIEND_TRAVEL_RECORDS_QUERY_PREFIX,
  viewerUserId,
  friendUserId,
  year,
];

export const getFriendTravelRecordYearsQueryKey = (
  viewerUserId: number | null,
  friendUserId: number | null
): [string, number | null, number | null] => [
  FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX,
  viewerUserId,
  friendUserId,
];

// 내 ID로 조회하면 서버가 400을 주므로, 같은 ID면 호출하지 않는다.
function canQueryFriend(
  viewerUserId: number | null,
  friendUserId: number | null
): friendUserId is number {
  return (
    viewerUserId !== null &&
    friendUserId !== null &&
    viewerUserId !== friendUserId
  );
}

/** 친구가 여행 폴더를 만든 연도(최신순). */
export function useFriendTravelRecordYears(friendUserId: number | null) {
  const viewerUserId = useAuthStore((state) => state.userId);

  const query = useQuery<number[], Error>({
    queryKey: getFriendTravelRecordYearsQueryKey(viewerUserId, friendUserId),
    queryFn: async () =>
      (await getFriendTravelRecordYears(friendUserId as number)).years,
    enabled: canQueryFriend(viewerUserId, friendUserId),
    retry: shouldRetryFriendsQuery,
  });

  const years = useMemo(
    () => getFriendRecordYearOptions(query.data),
    [query.data]
  );

  return {
    years,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

interface FriendTravelRecordsPageParam {
  cursor?: number;
}

/** 친구의 한 연도 여행 폴더. year가 null이면 조회하지 않는다. */
export function useFriendTravelRecords(
  friendUserId: number | null,
  year: number | null
) {
  const viewerUserId = useAuthStore((state) => state.userId);

  const query = useInfiniteQuery<
    GetFriendTravelRecordsResponse,
    Error,
    InfiniteData<GetFriendTravelRecordsResponse, FriendTravelRecordsPageParam>,
    [string, number | null, number | null, number | null],
    FriendTravelRecordsPageParam
  >({
    queryKey: getFriendTravelRecordsQueryKey(viewerUserId, friendUserId, year),
    // 첫 요청은 cursor를 비운다(잘못된 cursor는 TRAVEL_RECORD4006).
    queryFn: ({ pageParam }) =>
      getFriendTravelRecords(friendUserId as number, {
        year: year as number,
        size: FRIEND_TRAVEL_RECORDS_PAGE_SIZE,
        ...pageParam,
      }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId != null
        ? { cursor: lastPage.cursorId }
        : undefined,
    enabled: canQueryFriend(viewerUserId, friendUserId) && year !== null,
    retry: shouldRetryFriendsQuery,
  });

  const records = useMemo(
    () => getFriendTravelRecordsFromPages(query.data?.pages),
    [query.data?.pages]
  );

  return {
    records,
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
