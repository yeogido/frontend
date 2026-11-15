import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useToast } from '../../../components/toast';
import { useAcceptFriendRequest } from '../../../hooks/useFriendRequests';
import { getFriendProfileQueryKey } from '../../../hooks/useFriendProfile';
import { useSendFriendRequest } from '../../../hooks/useSendFriendRequest';
import { useAuthStore } from '../../../store/auth.store';
import type { FriendProfile } from '../../../types/friend.type';
import { getFriendRequestFailure } from '../utils/friendRequestError';
import {
  getSendRequestOutcome,
  type SendRequestOutcome,
} from '../utils/friendSendError';
import { patchFriendProfileRelation } from '../utils/friendProfile';

const REQUEST_SENT_MESSAGE = '친구 요청을 보냈어요.';
const ACCEPT_FAILURE_MESSAGE = '친구 요청 수락에 실패했어요.';

// 서버 상태와 어긋나서 실패한 경우만 프로필을 다시 받아 관계를 맞춘다.
const OUTCOMES_NEEDING_REFETCH: ReadonlySet<SendRequestOutcome> = new Set([
  'ALREADY_REQUESTED',
  'ALREADY_FRIEND',
  'ALREADY_RECEIVED',
  'NOT_FOUND',
]);

/**
 * 프로필 헤더의 "친구 맺기"와 "수락". 2-B의 요청·수락 훅을 그대로 쓰고, 이 화면의
 * 프로필 캐시만 여기서 맞춘다(검색 결과, 친구 목록, 받은·보낸 요청 갱신은 훅이
 * 맡는다). 진행 중에는 버튼을 막아 같은 요청이 두 번 나가지 않게 한다.
 */
export function useFriendProfileActions(profile: FriendProfile) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const viewerUserId = useAuthStore((state) => state.userId);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const queryKey = getFriendProfileQueryKey(viewerUserId, profile.userId);

  const run = async (action: () => Promise<void>) => {
    if (pendingRef.current) return;

    pendingRef.current = true;
    setIsPending(true);

    try {
      await action();
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  };

  // 진행 중인 조회가 있으면 먼저 취소한다. 그대로 두면 바뀌기 전에 시작된
  // 조회의 응답이 뒤늦게 도착해 방금 바꾼 관계를 되돌릴 수 있다.
  const patchProfile = async (
    relationStatus: FriendProfile['relationStatus'],
    requestId: number | null
  ) => {
    await queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<FriendProfile>(queryKey, (data) =>
      patchFriendProfileRelation(data, { relationStatus, requestId })
    );
  };

  return {
    isPending,
    send: () =>
      run(async () => {
        try {
          const result = await sendRequest.mutateAsync(profile.friendCode);

          await patchProfile('REQUESTED', result.requestId);
          showToast(REQUEST_SENT_MESSAGE);
        } catch (error) {
          const failure = getSendRequestOutcome(error);

          showToast(failure.message);

          if (OUTCOMES_NEEDING_REFETCH.has(failure.outcome)) {
            void queryClient.invalidateQueries({ queryKey });
          }
        }
      }),
    accept: () =>
      run(async () => {
        if (profile.requestId == null) return;

        try {
          await acceptRequest.mutateAsync(profile.requestId);
          await patchProfile('FRIEND', null);
          // 친구가 되면 이메일이 내려오므로 프로필을 다시 받는다.
          void queryClient.invalidateQueries({ queryKey });
        } catch (error) {
          const failure = getFriendRequestFailure(
            error,
            ACCEPT_FAILURE_MESSAGE
          );

          showToast(failure.message);

          if (failure.isAlreadyHandled) {
            void queryClient.invalidateQueries({ queryKey });
          }
        }
      }),
  };
}
