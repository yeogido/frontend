import type { QueryClient } from '@tanstack/react-query';

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
