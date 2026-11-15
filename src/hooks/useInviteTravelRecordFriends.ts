import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteTravelRecordFriends } from '../apis/travelRecords.api';
import { useAuthStore } from '../store/auth.store';
import { FRIEND_TRAVEL_QUERY_PREFIXES } from './friendQueryKeys';

/** 초대 성공 후 상세를 다시 읽는다. 수락 전에는 참여자를 로컬에서 추가하지 않는다. */
export function useInviteTravelRecordFriends(travelRecordId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteeUserIds: number[]) =>
      inviteTravelRecordFriends(travelRecordId, inviteeUserIds),
    retry: false,
    onMutate: () => {
      const { userId, authGeneration } = useAuthStore.getState();
      return { userId, authGeneration };
    },
    onSuccess: async (_result, _invitees, session) => {
      const current = useAuthStore.getState();
      if (
        !session ||
        current.userId !== session.userId ||
        current.authGeneration !== session.authGeneration
      )
        return;
      const { userId, authGeneration } = session;
      // PUBLIC 초대 성공은 공개범위도 바꾼다. 상세의 서버 권한을 다시 읽고
      // 목록·지도에도 새 공개범위를 반영한다. 대기자를 참여자로 추가하지 않는다.
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'travelRecord',
            travelRecordId,
            'folder',
            userId,
            authGeneration,
          ],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ['travelRecord', travelRecordId, userId, authGeneration],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ['travelRecords', userId, authGeneration],
        }),
        queryClient.invalidateQueries({
          queryKey: ['travelRecordMap', userId, authGeneration],
        }),
        queryClient.invalidateQueries({
          queryKey: ['travelRecordYears', userId, authGeneration],
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            FRIEND_TRAVEL_QUERY_PREFIXES.includes(String(queryKey[0])) &&
            queryKey[1] === userId,
        }),
      ]);
    },
  });
}
