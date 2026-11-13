import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getFriendRecordYearOptions,
  getFriendTravelRecordsFromPages,
  resolveFriendRecordYear,
  toFriendTravelFolder,
} from '../src/hooks/utils/friendTravelRecordPages.ts';
import type { FriendTravelRecordItem } from '../src/types/friend.type.ts';

const makeItem = (
  overrides: Partial<FriendTravelRecordItem> = {}
): FriendTravelRecordItem => ({
  travelRecordId: 85,
  title: '대구',
  regionId: 3,
  startDate: '2026-03-01',
  endDate: '2026-03-03',
  coverImageUrl: 'https://img/cover.jpg',
  folderTheme: 'BASIC',
  visibility: 'PUBLIC',
  previewImages: [],
  stickers: [],
  ...overrides,
});

const sticker = {
  recordStickerId: 1,
  stickerId: 9,
  imageUrl: 'https://img/s.png',
  positionX: 10,
  positionY: 20,
  rotation: 5,
  scale: 1.5,
  zIndex: 2,
};

test('preview images are used in imageOrder order', () => {
  const folder = toFriendTravelFolder(
    makeItem({
      previewImages: [
        { imageUrl: 'b', imageOrder: 2 },
        { imageUrl: 'a', imageOrder: 1 },
      ],
    })
  );

  assert.deepEqual(folder.photos, ['a', 'b']);
});

test('the cover image replaces missing preview images', () => {
  assert.deepEqual(
    toFriendTravelFolder(makeItem({ previewImages: null })).photos,
    ['https://img/cover.jpg']
  );
  assert.deepEqual(toFriendTravelFolder(makeItem()).photos, [
    'https://img/cover.jpg',
  ]);
});

test('a record without any photo becomes an empty folder', () => {
  const folder = toFriendTravelFolder(
    makeItem({ coverImageUrl: null, previewImages: undefined })
  );

  assert.deepEqual(folder.photos, ['']);
});

test('stickers become decorations with the detail fields', () => {
  const folder = toFriendTravelFolder(makeItem({ stickers: [sticker] }));

  assert.deepEqual(folder.decorations, [
    {
      id: '1',
      stickerId: 9,
      imageUrl: 'https://img/s.png',
      x: 10,
      y: 20,
      rotation: 5,
      scale: 1.5,
      zIndex: 2,
    },
  ]);
});

test('a sticker with a missing or odd field is skipped without an error', () => {
  const folder = toFriendTravelFolder(
    makeItem({
      stickers: [
        { ...sticker, recordStickerId: 1 },
        { ...sticker, recordStickerId: 2, positionX: undefined },
        { ...sticker, recordStickerId: 3, imageUrl: '' },
        { ...sticker, recordStickerId: 4, scale: 'big' as unknown as number },
        {},
        { ...sticker, recordStickerId: 5 },
      ],
    })
  );

  assert.deepEqual(
    folder.decorations.map((decoration) => decoration.id),
    ['1', '5']
  );
  assert.deepEqual(
    toFriendTravelFolder(makeItem({ stickers: null })).decorations,
    []
  );
});

test('visibility, region and extra fields follow the friend list rules', () => {
  const folder = toFriendTravelFolder(makeItem({ visibility: 'FRIENDS' }));

  assert.equal(folder.visibility, 'friends');
  assert.equal(
    toFriendTravelFolder(makeItem({ visibility: 'PUBLIC' })).visibility,
    'public'
  );
  assert.equal(
    toFriendTravelFolder(makeItem({ visibility: null })).visibility,
    undefined
  );
  assert.equal(folder.id, '85');
  assert.equal(folder.regionName, '');
  assert.equal(folder.regionCode, '');
  assert.equal(folder.period, '03.01 - 03.03');
  assert.equal('version' in folder, false);
  assert.equal('permissions' in folder, false);
});

test('pages merge into one list and drop repeated record ids', () => {
  const merged = getFriendTravelRecordsFromPages([
    {
      items: [makeItem({ travelRecordId: 1 }), makeItem({ travelRecordId: 2 })],
    },
    {
      items: [makeItem({ travelRecordId: 2 }), makeItem({ travelRecordId: 3 })],
    },
  ]);

  assert.deepEqual(
    merged.map((record) => record.travelRecordId),
    [1, 2, 3]
  );
  assert.deepEqual(getFriendTravelRecordsFromPages(undefined), []);
});

test('year options keep valid years, unique and newest first', () => {
  assert.deepEqual(
    getFriendRecordYearOptions([2024, 2026, 2024, 0, 1.5]),
    [2026, 2024]
  );
  assert.deepEqual(getFriendRecordYearOptions(undefined), []);
});

test('the default year prefers a valid url year, then this year, then the latest', () => {
  const years = [2026, 2025, 2023];

  assert.equal(resolveFriendRecordYear(years, 2023, 2026), 2023);
  // 목록에 없는 URL 연도는 올해로
  assert.equal(resolveFriendRecordYear(years, 2020, 2026), 2026);
  assert.equal(resolveFriendRecordYear(years, null, 2026), 2026);
  // 올해가 없으면 목록 최신 연도
  assert.equal(resolveFriendRecordYear([2025, 2023], null, 2026), 2025);
  assert.equal(resolveFriendRecordYear([2025, 2023], 2019, 2026), 2025);
  // 목록이 비면 null
  assert.equal(resolveFriendRecordYear([], 2025, 2026), null);
  assert.equal(resolveFriendRecordYear([], null, 2026), null);
});
