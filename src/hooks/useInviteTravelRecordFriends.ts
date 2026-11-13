import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteTravelRecordFriends } from '../apis/travelRecords.api';

/** 초대 성공 후 상세를 다시 읽는다. 수락 전에는 참여자를 로컬에서 추가하지 않는다. */
export function useInviteTravelRecordFriends(travelRecordId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteeUserIds: number[]) =>
      inviteTravelRecordFriends(travelRecordId, inviteeUserIds),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['travelRecord', travelRecordId],
      });
    },
  });
}
