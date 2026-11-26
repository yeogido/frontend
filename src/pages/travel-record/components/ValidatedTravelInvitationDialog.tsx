import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';
import { getTravelRecordInvitation } from '../../../apis/travelRecords.api';
import { useAuthStore } from '../../../store/auth.store';
import { mapReceivedTravelRecordInvitation } from '../mappers/travelRecordInvitationMapper';
import type { TravelRecordInvitation } from '../types';
import TravelRecordInvitationDialog from './TravelRecordInvitationDialog';
import { shouldRetryInvitationPreview } from '../utils/invitationPreviewRetry';
import { getInvitationPreviewFailureAction } from '../utils/invitationPreviewFailure';
import { getTravelRecordInvitationsQueryKey } from '../../../hooks/useTravelRecordInvitations';
import { shouldHandleInvitationPreviewFailure } from '../utils/invitationPreviewState';

export default function ValidatedTravelInvitationDialog({
  invitation,
  isPending,
  automatic,
  onAccept,
  onDecline,
  onClose,
  onPreviewFailure,
}: {
  invitation: TravelRecordInvitation;
  isPending?: boolean;
  automatic?: boolean;
  onAccept: (invitation: TravelRecordInvitation) => void;
  onDecline: (id: string) => void;
  onClose: () => void;
  onPreviewFailure?: (action: 'skip' | 'reset', invitationId: string) => void;
}) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const generation = useAuthStore((state) => state.authGeneration);
  const query = useQuery({
    queryKey: [
      'travelRecordInvitationPreview',
      userId,
      generation,
      invitation.id,
    ],
    queryFn: () => getTravelRecordInvitation(Number(invitation.id)),
    staleTime: 0,
    retry: shouldRetryInvitationPreview,
    refetchOnWindowFocus: true,
  });
  const handleFailure = useEffectEvent((error: unknown) => {
    console.warn('공유 앨범 초대 미리보기를 불러오지 못했습니다.', error);
    const action = getInvitationPreviewFailureAction(automatic === true, error);
    if (action === 'skip') {
      void queryClient.invalidateQueries({
        queryKey: getTravelRecordInvitationsQueryKey(userId, generation),
        exact: true,
      });
    }
    if (action !== 'wait') onPreviewFailure?.(action, invitation.id);
  });
  useEffect(() => {
    if (
      query.isError &&
      !query.isFetching &&
      shouldHandleInvitationPreviewFailure(Boolean(query.data), query.error)
    )
      handleFailure(query.error);
  }, [query.isError, query.isFetching, query.error, query.data]);
  if (
    !query.data ||
    (query.isError && shouldHandleInvitationPreviewFailure(true, query.error))
  )
    return null;
  return (
    <TravelRecordInvitationDialog
      invitation={mapReceivedTravelRecordInvitation(query.data)}
      isPending={isPending}
      automatic={automatic}
      onAccept={onAccept}
      onDecline={onDecline}
      onClose={onClose}
    />
  );
}
