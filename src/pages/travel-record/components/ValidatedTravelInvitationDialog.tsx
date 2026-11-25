import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getTravelRecordInvitation } from '../../../apis/travelRecords.api';
import { useAuthStore } from '../../../store/auth.store';
import { mapReceivedTravelRecordInvitation } from '../mappers/travelRecordInvitationMapper';
import type { TravelRecordInvitation } from '../types';
import TravelRecordInvitationDialog from './TravelRecordInvitationDialog';
import { shouldRetryInvitationPreview } from '../utils/invitationPreviewRetry';

export default function ValidatedTravelInvitationDialog({
  invitation,
  isPending,
  automatic,
  onAccept,
  onDecline,
  onClose,
}: {
  invitation: TravelRecordInvitation;
  isPending?: boolean;
  automatic?: boolean;
  onAccept: (invitation: TravelRecordInvitation) => void;
  onDecline: (id: string) => void;
  onClose: () => void;
}) {
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
  useEffect(() => {
    if (query.isError)
      console.warn(
        '공유 앨범 초대 미리보기를 불러오지 못했습니다.',
        query.error
      );
  }, [query.isError, query.error]);
  if (query.isPending || query.isFetching || query.isError) return null;
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
