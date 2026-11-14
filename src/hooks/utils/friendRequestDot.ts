import type { QueryClient } from '@tanstack/react-query';

// 훅 파일은 react-query와 스토어를 import해서 Node 테스트 러너가 읽지 못한다.
// 헤더의 받은 친구 요청 점에 쓰는 키, 표시 판단, 무효화만 따로 두어 그대로 검증한다.

// 계정별로 캐시를 분리한다(userId가 인덱스 1). 받은 요청 목록 쿼리
// ['friendRequests', 'received', userId]와는 첫 세그먼트부터 달라 겹치지 않는다.
export const FRIEND_REQUEST_PRESENCE_QUERY_PREFIX = 'friendRequestPresence';

export const getFriendRequestPresenceQueryKey = (
  userId: number | null
): [string, number | null] => [FRIEND_REQUEST_PRESENCE_QUERY_PREFIX, userId];

/** 받은 요청 수가 바뀔 수 있을 때 점 쿼리를 다시 받게 한다. */
export function invalidateFriendRequestPresence(
  queryClient: Pick<QueryClient, 'invalidateQueries'>,
  userId: number | null
) {
  void queryClient.invalidateQueries({
    queryKey: getFriendRequestPresenceQueryKey(userId),
  });
}

/**
 * 점을 보여 줄 화면. 친구 목록과 친구 프로필에서만 보이고, 받은 요청 화면에서는
 * 목록이 바로 보이므로 숨긴다(헤더의 친구 아이콘은 그대로).
 */
export function isFriendRequestDotPath(pathname: string): boolean {
  if (
    pathname === '/friends/requests' ||
    pathname.startsWith('/friends/requests/')
  ) {
    return false;
  }

  return pathname === '/friends' || pathname.startsWith('/friends/');
}

interface DotState {
  enabled: boolean;
  isPending: boolean;
  isError: boolean;
  requestCount: number;
}

/** 성공했고 받은 요청이 1건 이상일 때만 보인다. 로딩, 오류, 비활성에서는 숨긴다. */
export function shouldShowFriendRequestDot({
  enabled,
  isPending,
  isError,
  requestCount,
}: DotState): boolean {
  return enabled && !isPending && !isError && requestCount > 0;
}

/** 친구 요청 버튼의 접근성 이름. 점은 이미지가 아니라 이 문구로 전달한다. */
export function getFriendRequestButtonLabel(hasRequest: boolean): string {
  return hasRequest ? '친구 요청, 새 요청 있음' : '친구 요청';
}
