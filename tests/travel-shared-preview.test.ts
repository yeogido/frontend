import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mapSharedTravelRecordPreview,
  isValidTravelShareToken,
} from '../src/pages/travel-record/mappers/travelSharedPreview.ts';

test('shared preview uses the album owner and preserves the supplied photos and stickers', () => {
  const result = mapSharedTravelRecordPreview({
    travelRecordId: 91,
    visibility: 'FRIENDS',
    canAccept: true,
    owner: { userId: 6, nickname: '소유자', profileImageUrl: null },
    detail: null,
    preview: {
      travelRecordId: 91,
      title: '여행',
      regionId: 1,
      regionName: '서울',
      startDate: '2026-11-05',
      endDate: '2026-11-06',
      folderTheme: 'BASIC',
      previewImages: [{ imageUrl: 'photo.jpg', imageOrder: 1 }],
      stickers: [
        {
          recordStickerId: 3,
          stickerId: 4,
          imageUrl: 'sticker.png',
          positionX: 0.2,
          positionY: 0.4,
          rotation: 0,
          scale: 1,
          zIndex: 1,
        },
      ],
    },
  });
  assert.equal(result.inviterName, '소유자');
  assert.deepEqual(result.folder.photos, ['photo.jpg']);
  assert.equal(result.folder.decorations?.[0]?.imageUrl, 'sticker.png');
});

test('accepts only the documented lowercase 64-digit share token', () => {
  assert.equal(isValidTravelShareToken('a'.repeat(64)), true);
  for (const invalid of ['', 'a'.repeat(63), 'A'.repeat(64), '../path'])
    assert.equal(isValidTravelShareToken(invalid), false);
});
