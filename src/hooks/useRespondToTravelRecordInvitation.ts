import { useRef } from 'react';
import {
  useMutation,
  useMutationState,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { respondToTravelRecordInvitation } from '../apis/travelRecords.api';
import { getApiErrorMessage, normalizeApiError } from '../apis/common';
import { useToast } from '../components/toast';
import { useAuthStore } from '../store/auth.store';
import { TRAVEL_RECORD_MAP_QUERY_KEY } from '../pages/travel-record/utils/mapAuth';
import type {
  TravelRecordInvitationListResponse,
  TravelRecordInvitationResponseStatus,
} from '../types/travelRecord.type';
import { getTravelRecordInvitationsQueryKey } from './useTravelRecordInvitations';

interface ResponseVariables {
  invitationId: number;
  status: TravelRecordInvitationResponseStatus;
  userId: number;
  authGeneration: number;
}
const isCurrentSession = (session: ResponseVariables) => {
  const current = useAuthStore.getState();
  return (
    current.userId === session.userId &&
    current.authGeneration === session.authGeneration
  );
};
const getLockKey = (session: ResponseVariables) =>
  `${session.userId}:${session.authGeneration}:${session.invitationId}`;

export function useRespondToTravelRecordInvitation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const locks = useRef(new Set<string>());
  const mutationKey = ['respondTravelRecordInvitation', userId, authGeneration];
  const pendingIds = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: (mutation) =>
      (mutation.state.variables as ResponseVariables).invitationId,
  });
  const mutation = useMutation({
    mutationKey,
    mutationFn: ({ invitationId, status }: ResponseVariables) =>
      respondToTravelRecordInvitation(invitationId, { status }),
    retry: false,
    onSuccess: (result, session) => {
      if (!isCurrentSession(session)) return;
      const queryKey = getTravelRecordInvitationsQueryKey(
        session.userId,
        session.authGeneration
      );
      // 서버가 요청한 최종 상태를 확인해 준 경우만 카드 제거·성공 안내를 한다.
      if (result.status !== session.status) {
        void queryClient.invalidateQueries({ queryKey, exact: true });
        showToast('초대 상태를 다시 확인해 주세요.');
        return;
      }
      queryClient.setQueryData<
        InfiniteData<TravelRecordInvitationListResponse, number | undefined>
      >(queryKey, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.filter(
                  (item) => item.invitationId !== result.invitationId
                ),
              })),
            }
          : data
      );
      void queryClient.invalidateQueries({ queryKey, exact: true });
      if (result.status === 'ACCEPTED') {
        void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
        void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
        void queryClient.invalidateQueries({
          queryKey: TRAVEL_RECORD_MAP_QUERY_KEY,
        });
        void queryClient.invalidateQueries({
          queryKey: ['travelRecord', result.travelRecordId],
        });
      }
      showToast(
        result.status === 'ACCEPTED'
          ? '초대를 수락했어요.'
          : '초대를 거절했어요.'
      );
    },
    onError: (error, session) => {
      if (!isCurrentSession(session)) return;
      const { code, status } = normalizeApiError(error);
      if (
        status === 403 ||
        [
          'TRAVEL_RECORD4042',
          'TRAVEL_RECORD4094',
          'TRAVEL_RECORD4095',
        ].includes(code)
      ) {
        void queryClient.invalidateQueries({
          queryKey: getTravelRecordInvitationsQueryKey(
            session.userId,
            session.authGeneration
          ),
          exact: true,
        });
      }
      showToast(
        getApiErrorMessage(
          error,
          '초대를 처리하지 못했어요. 다시 시도해 주세요.'
        )
      );
    },
    onSettled: (_result, _error, session) => {
      locks.current.delete(getLockKey(session));
    },
  });
  return {
    pendingIds: new Set(pendingIds.map(String)),
    respond: (
      invitationId: string,
      status: TravelRecordInvitationResponseStatus
    ) => {
      const session = useAuthStore.getState();
      if (session.userId === null) return;
      const variables = {
        invitationId: Number(invitationId),
        status,
        userId: session.userId,
        authGeneration: session.authGeneration,
      };
      if (
        !Number.isSafeInteger(variables.invitationId) ||
        variables.invitationId <= 0 ||
        locks.current.has(getLockKey(variables))
      )
        return;
      locks.current.add(getLockKey(variables));
      mutation.mutate(variables);
    },
  };
}
