import type {
  TravelRecordInvitationListResponse,
  TravelRecordReceivedInvitation,
} from '../../../types/travelRecord.type';
import { getFriendAvatarColor } from '../../friends/utils/friendAvatarColor.ts';
import type { TravelRecordInvitation } from '../types';

export function mapReceivedTravelRecordInvitation(
  invitation: TravelRecordReceivedInvitation
): TravelRecordInvitation {
  const { travelRecord, inviter } = invitation;
  return {
    id: String(invitation.invitationId),
    inviterName: inviter.nickname,
    inviterColor: getFriendAvatarColor(inviter.userId),
    inviterProfileImageUrl: inviter.profileImageUrl,
    folder: {
      id: String(travelRecord.travelRecordId),
      title: travelRecord.title,
      startDate: travelRecord.startDate,
      endDate: travelRecord.endDate,
      period: `${travelRecord.startDate.slice(5).replace('-', '.')} - ${travelRecord.endDate.slice(5).replace('-', '.')}`,
    },
  };
}

export function getReceivedInvitationsFromPages(
  pages: TravelRecordInvitationListResponse[] | undefined
): TravelRecordInvitation[] {
  const seen = new Set<number>();
  return (pages ?? []).flatMap((page) =>
    page.items.flatMap((item) => {
      if (seen.has(item.invitationId) || item.status !== 'PENDING') return [];
      seen.add(item.invitationId);
      return [mapReceivedTravelRecordInvitation(item)];
    })
  );
}
