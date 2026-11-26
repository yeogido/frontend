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

test('received invitation maps the actual inviter and preview photos and stickers', () => {
  const card = mapReceivedTravelRecordInvitation({
    ...invitation,
    travelRecord: {
      ...invitation.travelRecord,
      regionName: '부산시',
      previewImages: [
        { imageUrl: 'second.jpg', imageOrder: 2, uploader: null },
        { imageUrl: 'first.jpg', imageOrder: 1, uploader: null },
      ],
      stickers: [
        {
          recordStickerId: 7,
          stickerId: 8,
          imageUrl: 'sticker.png',
          positionX: 0.2,
          positionY: 0.4,
          rotation: 12,
          scale: 1,
          zIndex: 2,
        },
      ],
      photoCount: 2,
    },
  });
  assert.equal(card.id, '101');
  assert.equal(card.inviterName, '초대한 친구');
  assert.equal(card.folder.id, '20');
  assert.equal(card.folder.period, '12.31 - 01.02');
  assert.deepEqual(card.folder.photos, ['first.jpg', 'second.jpg']);
  assert.equal(card.folder.regionName, '부산시');
  assert.deepEqual(card.folder.decorations, [
    {
      id: '7',
      stickerId: 8,
      imageUrl: 'sticker.png',
      x: 0.2,
      y: 0.4,
      rotation: 12,
      scale: 1,
      zIndex: 2,
    },
  ]);
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
