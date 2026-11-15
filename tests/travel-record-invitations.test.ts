import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mapReceivedTravelRecordInvitation,
  getReceivedInvitationsFromPages,
} from '../src/pages/travel-record/mappers/travelRecordInvitationMapper.ts';
import type { TravelRecordReceivedInvitation } from '../src/types/travelRecord.type.ts';

const invitation: TravelRecordReceivedInvitation = {
  invitationId: 101,
  status: 'PENDING',
  inviter: { userId: 3, nickname: '초대한 친구', profileImageUrl: null },
  owner: { userId: 1, nickname: '생성자', profileImageUrl: null },
  travelRecord: {
    travelRecordId: 20,
    title: '부산 여행',
    regionId: 2,
    startDate: '2024-12-31',
    endDate: '2025-01-02',
    folderTheme: 'BASIC',
  },
  createdAt: '2026-11-12T12:00:00',
};

test('received invitation maps the actual inviter and basic album without inventing photos', () => {
  const card = mapReceivedTravelRecordInvitation(invitation);
  assert.equal(card.id, '101');
  assert.equal(card.inviterName, '초대한 친구');
  assert.equal(card.folder.id, '20');
  assert.equal(card.folder.period, '12.31 - 01.02');
  assert.equal('photos' in card.folder, false);
  assert.equal('decorations' in card.folder, false);
});

test('received invitation preserves the inviter profile image', () => {
  assert.equal(
    mapReceivedTravelRecordInvitation({
      ...invitation,
      inviter: {
        ...invitation.inviter,
        profileImageUrl: 'https://example.com/avatar.png',
      },
    }).inviterProfileImageUrl,
    'https://example.com/avatar.png'
  );
});

test('invitation pages keep server order, deduplicate IDs and exclude processed invitations', () => {
  const invitations = getReceivedInvitationsFromPages([
    {
      items: [invitation, { ...invitation, invitationId: 100 }],
      hasNext: true,
      cursorId: 100,
    },
    {
      items: [
        { ...invitation, invitationId: 100 },
        { ...invitation, invitationId: 99 },
        { ...invitation, invitationId: 98, status: 'DECLINED' },
      ],
      hasNext: false,
    },
  ]);
  assert.deepEqual(
    invitations.map((item) => item.id),
    ['101', '100', '99']
  );
  assert.deepEqual(getReceivedInvitationsFromPages(undefined), []);
});
