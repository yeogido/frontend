import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveTravelRecordById } from '../apis/travelRecords.api';
import { normalizeApiError } from '../apis/common';
import { useAuthStore } from '../store/auth.store';
import { useTravelRecordSessionStore } from '../store/travelRecordSession.store';
import {
  clearLeftTravelRecordQueries,
  type TravelRecordLeaveSession,
} from './utils/travelRecordLeaveCache';

export interface LeaveTravelRecordVariables extends TravelRecordLeaveSession {
  travelRecordId: number;
}

export function useLeaveTravelRecord() {
  const queryClient = useQueryClient();
  const isCurrentSession = (session: TravelRecordLeaveSession) => {
    const current = useAuthStore.getState();
    return (
      current.userId === session.userId &&
      current.authGeneration === session.authGeneration
    );
  };

  return useMutation({
    mutationFn: (variables: LeaveTravelRecordVariables) => {
      if (!isCurrentSession(variables))
        throw new Error('인증 상태가 변경되었습니다.');
      return leaveTravelRecordById(variables.travelRecordId);
    },
    retry: false,
    onSuccess: async (_result, session) => {
      await clearLeftTravelRecordQueries(
        queryClient,
        session.travelRecordId,
        session,
        () => isCurrentSession(session)
      );
      if (!isCurrentSession(session)) return;
      const editStore = useTravelRecordSessionStore.getState();
      if (editStore.editSession?.id === String(session.travelRecordId))
        editStore.clearEdit();
    },
    onError: (error, session) => {
      if (!isCurrentSession(session)) return;
      const { code, status } = normalizeApiError(error);
      if (status === 403 || status === 404 || code === 'TRAVEL_RECORD4096') {
        void queryClient.invalidateQueries({
          queryKey: [
            'travelRecord',
            session.travelRecordId,
            'folder',
            session.userId,
            session.authGeneration,
          ],
          exact: true,
        });
      }
    },
  });
}
