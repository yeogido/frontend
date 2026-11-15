import { useRef, useState } from 'react';

import { useToast } from '../../../components/toast';
import { useAcceptFriendRequest } from '../../../hooks/useFriendRequests';
import { useFriendSearchCache } from '../../../hooks/useFriendSearch';
import { useSendFriendRequest } from '../../../hooks/useSendFriendRequest';
import type { SearchedFriend } from '../../../types/friend.type';
import { getFriendRequestFailure } from '../utils/friendRequestError';
import { getSendRequestOutcome } from '../utils/friendSendError';

const REQUEST_SENT_MESSAGE = '친구 요청을 보냈어요.';
const ACCEPT_FAILURE_MESSAGE = '친구 요청 수락에 실패했어요.';

/**
 * 검색 결과 행의 "친구 맺기"와 "수락"을 확인 없이 바로 요청한다. 한 행의 요청이
 * 진행되는 동안에는 그 행의 버튼을 막아 같은 요청이 두 번 나가지 않게 한다.
 * 성공과 서버 상태 불일치에 따른 캐시 갱신은 훅이 맡고, 여기서는 안내만 띄운다.
 */
export function useFriendSearchActions() {
  const { showToast } = useToast();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const searchCache = useFriendSearchCache();
  const pendingRef = useRef(new Set<number>());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  const run = async (userId: number, action: () => Promise<void>) => {
    if (pendingRef.current.has(userId)) return;

    pendingRef.current.add(userId);
    setPendingIds(new Set(pendingRef.current));

    try {
      await action();
    } finally {
      pendingRef.current.delete(userId);
      setPendingIds(new Set(pendingRef.current));
    }
  };

  return {
    pendingIds,
    send: (friend: SearchedFriend) =>
      run(friend.userId, async () => {
        try {
          await sendRequest.mutateAsync(friend.friendCode);
          showToast(REQUEST_SENT_MESSAGE);
        } catch (error) {
          showToast(getSendRequestOutcome(error).message);
        }
      }),
    accept: (friend: SearchedFriend) =>
      run(friend.userId, async () => {
        if (friend.requestId == null) return;

        try {
          await acceptRequest.mutateAsync(friend.requestId);
          await searchCache.patchItem(friend.userId, {
            relationStatus: 'FRIEND',
          });
        } catch (error) {
          const failure = getFriendRequestFailure(
            error,
            ACCEPT_FAILURE_MESSAGE
          );

          showToast(failure.message);

          // 이미 처리된 요청이면 이 행의 관계가 서버와 달라졌으므로 다시 받는다.
          if (failure.isAlreadyHandled) {
            void searchCache.invalidate();
          }
        }
      }),
  };
}
