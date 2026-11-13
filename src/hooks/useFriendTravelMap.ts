import { useMemo } from 'react';
import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  getFriendTravelMap,
  getFriendTravelMapYears,
} from '../apis/friends.api';
import { collectTravelRecords } from '../pages/travel-record/utils/collectTravelRecords';
import { useAuthStore } from '../store/auth.store';
import type { FriendTravelMapItem } from '../types/friend.type';
import {
  getFriendMapYearOptions,
  mergeFriendTravelMapItems,
} from './utils/friendTravelMapPages';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

// 서버가 허용하는 최대값. 커서를 끝까지 따라가 한 연도의 기록을 모두 모은다.
const FRIEND_TRAVEL_MAP_PAGE_SIZE = 100;

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const FRIEND_TRAVEL_MAP_QUERY_PREFIX = 'friendTravelMap';
export const FRIEND_TRAVEL_MAP_YEARS_QUERY_PREFIX = 'friendTravelMapYears';

export const getFriendTravelMapQueryKey = (
  viewerUserId: number | null,
  friendUserId: number | null,
  year: number
): [string, number | null, number | null, number] => [
  FRIEND_TRAVEL_MAP_QUERY_PREFIX,
  viewerUserId,
  friendUserId,
  year,
];

export const getFriendTravelMapYearsQueryKey = (
  viewerUserId: number | null,
  friendUserId: number | null
): [string, number | null, number | null] => [
  FRIEND_TRAVEL_MAP_YEARS_QUERY_PREFIX,
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

/** 친구가 여행 기록을 남긴 연도(최신순). 드롭다운은 "전체" + 이 목록이다. */
export function useFriendTravelMapYears(friendUserId: number | null) {
  const viewerUserId = useAuthStore((state) => state.userId);

  const query = useQuery<number[], Error>({
    queryKey: getFriendTravelMapYearsQueryKey(viewerUserId, friendUserId),
    queryFn: async () =>
      (await getFriendTravelMapYears(friendUserId as number)).years,
    enabled: canQueryFriend(viewerUserId, friendUserId),
    retry: shouldRetryFriendsQuery,
  });

  const years = useMemo(
    () => getFriendMapYearOptions(query.data),
    [query.data]
  );

  return {
    years,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// 모듈 스코프에 두어 참조가 고정되게 한다. combine이 렌더마다 새 함수면
// react-query가 결과를 재사용하지 못한다.
const combineYearQueries = (
  results: UseQueryResult<FriendTravelMapItem[], Error>[]
) => ({
  lists: results.map((query) => query.data),
  isPending: results.some((query) => query.isPending),
  isError: results.some((query) => query.isError),
  retry: () =>
    results
      .filter((query) => query.isError)
      .forEach((query) => void query.refetch()),
});

/**
 * 친구의 여행 지도 기록. year가 null이면 전체인데, year를 생략했을 때 서버가
 * 전체를 주는지 확인하지 못해서 연도 목록을 연도별로 요청해 합친다(연도별 캐시는
 * 선택한 연도와 공유된다).
 */
export function useFriendTravelMap(
  friendUserId: number | null,
  year: number | null
) {
  const viewerUserId = useAuthStore((state) => state.userId);
  const canQuery = canQueryFriend(viewerUserId, friendUserId);
  const yearsQuery = useFriendTravelMapYears(friendUserId);
  const yearsToLoad = year === null ? yearsQuery.years : [year];
  // 전체는 연도 목록이 와야 어느 연도를 받을지 알 수 있다.
  const canLoadYears = canQuery && (year !== null || !yearsQuery.isPending);

  const combined = useQueries({
    queries: yearsToLoad.map((targetYear) => ({
      queryKey: getFriendTravelMapQueryKey(
        viewerUserId,
        friendUserId,
        targetYear
      ),
      queryFn: () =>
        collectTravelRecords((cursor) =>
          getFriendTravelMap(friendUserId as number, {
            year: targetYear,
            size: FRIEND_TRAVEL_MAP_PAGE_SIZE,
            cursor,
          })
        ),
      enabled: canLoadYears && !(year === null && yearsQuery.isError),
      retry: shouldRetryFriendsQuery,
    })),
    combine: combineYearQueries,
  });

  const items = useMemo(
    () => mergeFriendTravelMapItems(combined.lists),
    [combined.lists]
  );
  const isYearsBlocking = year === null && yearsQuery.isPending;
  const isYearsFailed = year === null && yearsQuery.isError;

  return {
    items,
    isPending: isYearsBlocking || combined.isPending,
    isError: isYearsFailed || combined.isError,
    retry: () => {
      if (isYearsFailed) void yearsQuery.refetch();
      combined.retry();
    },
  };
}
