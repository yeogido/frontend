import type { TravelRecordSharedView } from '../../../types/travelRecord.type';
import { mapReceivedTravelRecordInvitation } from './travelRecordInvitationMapper.ts';

export const isValidTravelShareToken = (token: string) =>
  /^[a-f0-9]{64}$/.test(token);

export function mapSharedTravelRecordPreview(shared: TravelRecordSharedView) {
  if (!shared.preview) throw new Error('공유 미리보기가 없습니다.');
  return mapReceivedTravelRecordInvitation({
    invitationId: shared.travelRecordId,
    status: 'PENDING',
    inviter: shared.owner,
    owner: shared.owner,
    travelRecord: shared.preview,
    createdAt: '',
  });
}
