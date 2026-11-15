import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptFriendByQr } from '../apis/friends.api';
import { getQrScanError } from '../pages/friends/utils/friendQrScan';
import { useAuthStore } from '../store/auth.store';
import type { AcceptFriendQrResult } from '../types/friend.type';
import {
  FRIENDSHIP_QUERY_PREFIXES,
  invalidateFriendshipQueries,
} from './friendQueryKeys';
import { FRIEND_REQUESTS_QUERY_PREFIX } from './useFriendRequests';
import { FRIEND_PROFILE_QUERY_PREFIX } from './useFriendProfile';
import { FRIEND_SEARCH_QUERY_PREFIX } from './useFriendSearch';
import { FRIENDS_QUERY_PREFIX } from './useFriends';

// friendQueryKeys.ts의 접두사가 이 훅 파일들의 상수와 같은지 타입으로 확인한다.
// 값이 어긋나면 여기서 타입 오류가 난다.
export const FRIENDSHIP_PREFIXES_IN_SYNC: [
  typeof FRIENDSHIP_QUERY_PREFIXES.friends,
  typeof FRIENDSHIP_QUERY_PREFIXES.friendSearch,
  typeof FRIENDSHIP_QUERY_PREFIXES.friendProfile,
  typeof FRIENDSHIP_QUERY_PREFIXES.friendRequests,
] = [
  FRIENDS_QUERY_PREFIX,
  FRIEND_SEARCH_QUERY_PREFIX,
  FRIEND_PROFILE_QUERY_PREFIX,
  FRIEND_REQUESTS_QUERY_PREFIX,
];

interface AcceptFriendQrVariables {
  qrToken: string;
  /** 이미 친구라는 응답(FRIEND4091)이 와도 캐시를 맞추려고 미리 받아 둔 상대 ID. */
  friendUserId: number;
}

/**
 * QR로 친구 맺기. 수락 없이 바로 친구가 되므로 기존 요청 수락(PATCH)이 아니라 QR
 * 전용 API를 쓴다. 성공하면 친구 관계가 새로 생긴 것이라 관련 캐시를 다시 받는다.
 */
export function useAcceptFriendQr() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation<AcceptFriendQrResult, Error, AcceptFriendQrVariables>({
    mutationFn: ({ qrToken }) => acceptFriendByQr(qrToken),
    onSuccess: (result) =>
      invalidateFriendshipQueries(queryClient, userId, result.friend.userId),
    // 이미 친구라는 응답도 서버에는 관계가 있다는 뜻이라 낡은 목록을 맞춘다.
    onError: (error, { friendUserId }) => {
      if (getQrScanError(error).kind === 'already-friend') {
        return invalidateFriendshipQueries(queryClient, userId, friendUserId);
      }
    },
  });
}
