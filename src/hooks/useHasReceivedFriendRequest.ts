import { useQuery } from '@tanstack/react-query';

import { getReceivedFriendRequests } from '../apis/friends.api';
import { useAuthStore } from '../store/auth.store';
import type { GetReceivedFriendRequestsResponse } from '../types/friend.type';
import {
  getFriendRequestPresenceQueryKey,
  shouldShowFriendRequestDot,
} from './utils/friendRequestDot';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

/**
 * 받은 친구 요청이 하나라도 있는지. 첫 한 건만 받아 확인한다. 점을 보여 줄 화면에서만
 * 조회하고(enabled), 재조회는 전역 기본값(마운트, 창 포커스)을 따른다.
 */
export function useHasReceivedFriendRequest(enabled: boolean): boolean {
  const userId = useAuthStore((state) => state.userId);
  const isEnabled = enabled && userId !== null;

  const query = useQuery<GetReceivedFriendRequestsResponse, Error>({
    queryKey: getFriendRequestPresenceQueryKey(userId),
    queryFn: () => getReceivedFriendRequests({ size: 1 }),
    enabled: isEnabled,
    retry: shouldRetryFriendsQuery,
  });

  return shouldShowFriendRequestDot({
    enabled: isEnabled,
    isPending: query.isPending,
    isError: query.isError,
    requestCount: query.data?.items.length ?? 0,
  });
}
