import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendFriendRequest } from '../apis/friends.api';
import { getSendRequestOutcome } from '../pages/friends/utils/friendSendError';
import { useAuthStore } from '../store/auth.store';
import type { SendFriendRequestResult } from '../types/friend.type';
import { getFriendRequestsQueryKey } from './useFriendRequests';
import { useFriendSearchCache } from './useFriendSearch';
import { FRIENDS_QUERY_PREFIX } from './useFriends';
import { invalidateFriendRequestPresence } from './utils/friendRequestDot';
import { normalizeFriendCode } from './utils/friendSearchPages';

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const searchCache = useFriendSearchCache();

  return useMutation<SendFriendRequestResult, Error, string>({
    mutationFn: (friendCode) =>
      sendFriendRequest(normalizeFriendCode(friendCode)),
    onSuccess: async (result) => {
      await searchCache.patchItem(result.receiver.userId, {
        relationStatus: 'REQUESTED',
        requestId: result.requestId,
      });
      void queryClient.invalidateQueries({
        queryKey: getFriendRequestsQueryKey('sent', userId),
      });
    },
    // 서버 상태와 어긋나서 실패한 경우, 검색 결과를 다시 받아 맞춘다.
    onError: (error) => {
      const { outcome } = getSendRequestOutcome(error);

      if (outcome === 'FAILED' || outcome === 'SELF') {
        return;
      }

      void searchCache.invalidate();

      if (outcome === 'ALREADY_FRIEND') {
        void queryClient.invalidateQueries({
          queryKey: [FRIENDS_QUERY_PREFIX, userId],
        });
      } else if (outcome === 'ALREADY_RECEIVED') {
        void queryClient.invalidateQueries({
          queryKey: getFriendRequestsQueryKey('received', userId),
        });
        invalidateFriendRequestPresence(queryClient, userId);
      }
    },
  });
}
