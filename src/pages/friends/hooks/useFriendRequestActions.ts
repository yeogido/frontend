import { useRef, useState } from 'react';

import { useToast } from '../../../components/toast';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriendRequestFromCache,
} from '../../../hooks/useFriendRequests';
import { getFriendRequestFailure } from '../utils/friendRequestError';

interface UseFriendRequestActionsParams {
  refetchReceived: () => unknown;
  refetchSent: () => unknown;
}

/**
 * 수락·삭제·취소를 확인 없이 바로 요청한다. 한 요청이 진행되는 동안에는 그
 * 요청의 버튼을 막아 같은 요청이 두 번 나가지 않게 한다. 실패하면 토스트를
 * 띄우고, 이미 처리된 요청 등으로 화면이 서버와 어긋났을 수 있어 목록을 다시
 * 받는다. 이미 처리됐거나 없는 요청(FRIEND4094, FRIEND4042)이면 그 행을
 * 캐시에서 빼고 받은·보낸 요청 두 목록을 모두 다시 받는다. 성공하면 훅이
 * 캐시에서 해당 행을 뺀다.
 */
export function useFriendRequestActions({
  refetchReceived,
  refetchSent,
}: UseFriendRequestActionsParams) {
  const { showToast } = useToast();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const removeFromCache = useRemoveFriendRequestFromCache();
  const pendingRef = useRef(new Set<number>());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  const run = async (
    kind: 'received' | 'sent',
    requestId: number,
    action: (requestId: number) => Promise<unknown>,
    failureMessage: string,
    refetch: () => unknown
  ) => {
    if (pendingRef.current.has(requestId)) return;

    pendingRef.current.add(requestId);
    setPendingIds(new Set(pendingRef.current));

    try {
      await action(requestId);
    } catch (error) {
      const failure = getFriendRequestFailure(error, failureMessage);

      showToast(failure.message);

      if (failure.isAlreadyHandled) {
        removeFromCache(kind, requestId);
        void refetchReceived();
        void refetchSent();
      } else {
        void refetch();
      }
    } finally {
      pendingRef.current.delete(requestId);
      setPendingIds(new Set(pendingRef.current));
    }
  };

  return {
    pendingIds,
    accept: (requestId: number) =>
      run(
        'received',
        requestId,
        acceptRequest.mutateAsync,
        '친구 요청 수락에 실패했어요.',
        refetchReceived
      ),
    reject: (requestId: number) =>
      run(
        'received',
        requestId,
        rejectRequest.mutateAsync,
        '친구 요청 삭제에 실패했어요.',
        refetchReceived
      ),
    cancel: (requestId: number) =>
      run(
        'sent',
        requestId,
        cancelRequest.mutateAsync,
        '친구 요청 취소에 실패했어요.',
        refetchSent
      ),
  };
}
