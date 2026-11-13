import { useMemo } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { getFriendLocalCourses, getFriendProfile } from '../apis/friends.api';
import { useAuthStore } from '../store/auth.store';
import type {
  FriendProfile,
  GetFriendLocalCoursesResponse,
} from '../types/friend.type';
import { getFriendCoursesFromPages } from './utils/friendCoursePages';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

// 서버 기본값과 같다.
const FRIEND_COURSES_PAGE_SIZE = 10;

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const FRIEND_PROFILE_QUERY_PREFIX = 'friendProfile';
export const FRIEND_COURSES_QUERY_PREFIX = 'friendCourses';

export const getFriendProfileQueryKey = (
  viewerUserId: number | null,
  friendUserId: number | null
): [string, number | null, number | null] => [
  FRIEND_PROFILE_QUERY_PREFIX,
  viewerUserId,
  friendUserId,
];

export const getFriendCoursesQueryKey = (
  viewerUserId: number | null,
  friendUserId: number | null
): [string, number | null, number | null] => [
  FRIEND_COURSES_QUERY_PREFIX,
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

/** 친구가 아니어도 조회할 수 있는 사용자 프로필. */
export function useFriendProfile(friendUserId: number | null) {
  const viewerUserId = useAuthStore((state) => state.userId);

  const query = useQuery<FriendProfile, Error>({
    queryKey: getFriendProfileQueryKey(viewerUserId, friendUserId),
    queryFn: () => getFriendProfile(friendUserId as number),
    enabled: canQueryFriend(viewerUserId, friendUserId),
    retry: shouldRetryFriendsQuery,
  });

  return {
    profile: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

interface FriendCoursesPageParam {
  cursorId?: number;
}

/** 친구가 등록한 우리동네 코스. */
export function useFriendLocalCourses(friendUserId: number | null) {
  const viewerUserId = useAuthStore((state) => state.userId);

  const query = useInfiniteQuery<
    GetFriendLocalCoursesResponse,
    Error,
    InfiniteData<GetFriendLocalCoursesResponse, FriendCoursesPageParam>,
    [string, number | null, number | null],
    FriendCoursesPageParam
  >({
    queryKey: getFriendCoursesQueryKey(viewerUserId, friendUserId),
    queryFn: ({ pageParam }) =>
      getFriendLocalCourses(friendUserId as number, {
        size: FRIEND_COURSES_PAGE_SIZE,
        ...pageParam,
      }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId != null
        ? { cursorId: lastPage.cursorId }
        : undefined,
    enabled: canQueryFriend(viewerUserId, friendUserId),
    retry: shouldRetryFriendsQuery,
  });

  const courses = useMemo(
    () => getFriendCoursesFromPages(query.data?.pages),
    [query.data?.pages]
  );

  return {
    courses,
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
