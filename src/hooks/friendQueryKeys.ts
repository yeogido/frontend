import type { QueryClient } from '@tanstack/react-query';

import { invalidateFriendRequestPresence } from './utils/friendRequestDot.ts';

// 친구 관계에 따라 서버 응답이 달라지는 친구 여행 데이터의 쿼리 키. 키는
// [접두사, 내 ID, 친구 ID, ...]이고 내 ID가 인덱스 1이다(계정별 캐시 분리).
// 파일이 react-query를 type import만 해서 Node 테스트 러너에서 그대로 검증한다.
export const FRIEND_TRAVEL_MAP_QUERY_PREFIX = 'friendTravelMap';
export const FRIEND_TRAVEL_MAP_YEARS_QUERY_PREFIX = 'friendTravelMapYears';
export const FRIEND_TRAVEL_RECORDS_QUERY_PREFIX = 'friendTravelRecords';
export const FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX =
  'friendTravelRecordYears';

/**
 * 친구가 되거나 친구를 끊으면 보이는 범위가 달라지는 쿼리의 접두사. 같은 성격의
 * 쿼리가 생기면 여기에 한 줄 추가한다.
 */
export const FRIEND_TRAVEL_QUERY_PREFIXES: readonly string[] = [
  FRIEND_TRAVEL_MAP_QUERY_PREFIX,
  FRIEND_TRAVEL_MAP_YEARS_QUERY_PREFIX,
  FRIEND_TRAVEL_RECORDS_QUERY_PREFIX,
  FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX,
];

/** 한 친구에 대한 쿼리 범위 키. 연도 등 뒤쪽 값은 접두사 매칭으로 함께 걸린다. */
export const getFriendTravelScopeQueryKey = (
  prefix: string,
  viewerUserId: number | null,
  friendUserId: number
): [string, number | null, number] => [prefix, viewerUserId, friendUserId];

/** 친구 관계가 바뀔 때 무효화할 키 목록. */
export const getFriendTravelInvalidationKeys = (
  viewerUserId: number | null,
  friendUserId: number
) =>
  FRIEND_TRAVEL_QUERY_PREFIXES.map((prefix) =>
    getFriendTravelScopeQueryKey(prefix, viewerUserId, friendUserId)
  );

/**
 * 친구 관계가 바뀐 뒤 그 친구의 여행 데이터를 다시 받게 한다. 블러 항목처럼 친구에게만
 * 내려오는 데이터가 캐시에 낡은 채 남는 것을 막는다. 다른 친구의 캐시는 건드리지 않는다.
 */
export function invalidateFriendTravelQueries(
  queryClient: Pick<QueryClient, 'invalidateQueries'>,
  viewerUserId: number | null,
  friendUserId: number
) {
  for (const queryKey of getFriendTravelInvalidationKeys(
    viewerUserId,
    friendUserId
  )) {
    void queryClient.invalidateQueries({ queryKey });
  }
}

// 다른 훅 파일이 가진 접두사와 같은 값이다. 그 파일들은 react-query와 API를 import해서
// 이 순수 파일이 가져올 수 없으므로 문자열을 따로 두고, 값이 어긋나면 이 상수를 쓰는
// useAcceptFriendQr.ts의 타입 검사가 실패한다.
export const FRIENDSHIP_QUERY_PREFIXES = {
  friends: 'friends',
  friendSearch: 'friendSearch',
  friendProfile: 'friendProfile',
  friendRequests: 'friendRequests',
} as const;

/**
 * 친구 관계가 새로 생겼을 때 다시 받을 쿼리 키. 친구 목록, 친구 검색, 친구 프로필,
 * 그 친구의 여행 데이터, 받은·보낸 요청 목록이다(받은 요청 존재 키는 따로 다룬다).
 */
export const getFriendshipInvalidationKeys = (
  viewerUserId: number | null,
  friendUserId: number
): readonly (readonly unknown[])[] => [
  [FRIENDSHIP_QUERY_PREFIXES.friends, viewerUserId],
  [FRIENDSHIP_QUERY_PREFIXES.friendSearch, viewerUserId],
  [FRIENDSHIP_QUERY_PREFIXES.friendProfile, viewerUserId],
  ...getFriendTravelInvalidationKeys(viewerUserId, friendUserId),
  [FRIENDSHIP_QUERY_PREFIXES.friendRequests, 'received', viewerUserId],
  [FRIENDSHIP_QUERY_PREFIXES.friendRequests, 'sent', viewerUserId],
];

/**
 * 친구 관계가 새로 생긴 뒤(QR로 맺기 등) 화면에 남은 낡은 캐시를 다시 받게 한다.
 * 받은 요청 존재 키는 진행 중인 조회를 먼저 취소해야 해서 따로 부른다.
 */
export async function invalidateFriendshipQueries(
  queryClient: Pick<QueryClient, 'cancelQueries' | 'invalidateQueries'>,
  viewerUserId: number | null,
  friendUserId: number
) {
  for (const queryKey of getFriendshipInvalidationKeys(
    viewerUserId,
    friendUserId
  )) {
    void queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }

  await invalidateFriendRequestPresence(queryClient, viewerUserId);
}
