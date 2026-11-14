import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findProvinceByCoordinates,
  getFriendMapYearOptions,
  getUnresolvedFriendMapRegionIds,
  mergeFriendTravelMapItems,
  normalizeFriendTravelMapItem,
  resolveFriendMapRegion,
  toFriendRegionPhotoRecords,
} from '../src/hooks/utils/friendTravelMapPages.ts';
import type { FriendTravelMapItem } from '../src/types/friend.type.ts';

const item = (
  travelRecordId: number,
  overrides: Partial<FriendTravelMapItem> = {}
): FriendTravelMapItem => ({
  blurred: false,
  travelRecordId,
  regionId: 1,
  regionName: '서울특별시',
  latitude: 37.5665,
  longitude: 126.978,
  startDate: '2026-05-01',
  endDate: '2026-05-03',
  title: '서울 여행',
  visibility: 'FRIENDS',
  images: [
    {
      imageId: 2,
      imageKey: 'b',
      imageUrl: 'https://img/second.png',
      imageOrder: 2,
    },
    {
      imageId: 1,
      imageKey: 'a',
      imageUrl: 'https://img/first.png',
      imageOrder: 1,
    },
  ],
  ...overrides,
});

const blurredItem = (
  travelRecordId: number,
  overrides: Partial<FriendTravelMapItem> = {}
) =>
  item(travelRecordId, {
    blurred: true,
    title: null,
    visibility: null,
    images: null,
    ...overrides,
  });

test('merging drops repeated travel records across year lists', () => {
  const merged = mergeFriendTravelMapItems([
    [item(1), item(2)],
    [item(2), item(3)],
    undefined,
  ]);

  assert.deepEqual(
    merged.map((record) => record.travelRecordId),
    [1, 2, 3]
  );
  assert.deepEqual(mergeFriendTravelMapItems([]), []);
});

test('normalizing a blurred item tolerates null fields', () => {
  const record = normalizeFriendTravelMapItem(blurredItem(5));

  assert.equal(record.blurred, true);
  assert.equal(record.title, '');
  assert.deepEqual(record.photos, []);
});

test('normalizing keeps the image order and ignores bad coordinates', () => {
  const record = normalizeFriendTravelMapItem(
    item(1, { latitude: null, longitude: Number.NaN })
  );

  assert.deepEqual(record.photos, [
    'https://img/first.png',
    'https://img/second.png',
  ]);
  assert.equal(record.latitude, null);
  assert.equal(record.longitude, null);
});

test('a visible item with null images does not crash', () => {
  const record = normalizeFriendTravelMapItem(
    item(1, { images: null, title: null })
  );

  assert.deepEqual(record.photos, []);
  assert.equal(record.title, '');
});

test('year options are unique, valid and newest first', () => {
  assert.deepEqual(
    getFriendMapYearOptions([2024, 2026, 2025, 2026]),
    [2026, 2025, 2024]
  );
  assert.deepEqual(
    getFriendMapYearOptions([2025, 0, -1, 2024.5, Number.NaN]),
    [2025]
  );
  assert.deepEqual(getFriendMapYearOptions(undefined), []);
});

test('only the server blurred flag decides blurring, not the visibility', () => {
  const [visible, blurred] = [
    toFriendRegionPhotoRecords([normalizeFriendTravelMapItem(item(1))]),
    toFriendRegionPhotoRecords([normalizeFriendTravelMapItem(blurredItem(2))]),
  ];

  assert.equal(visible.length, 1);
  assert.equal(visible[0].isBlurred, undefined);
  assert.equal(visible[0].folderId, '1');
  assert.equal(visible[0].photoUrl, 'https://img/first.png');
  assert.equal(blurred.length, 1);
  assert.equal(blurred[0].isBlurred, true);
  assert.equal(blurred[0].folderId, '');
  assert.ok(blurred[0].photoUrl.startsWith('data:image/svg+xml'));
});

test('the latest record wins for a region', () => {
  const photos = toFriendRegionPhotoRecords([
    normalizeFriendTravelMapItem(item(1, { startDate: '2025-01-01' })),
    normalizeFriendTravelMapItem(item(2, { startDate: '2026-01-01' })),
  ]);

  assert.equal(photos.length, 1);
  assert.equal(photos[0].folderId, '2');
});

test('a visible record without photos is skipped but a blurred one is kept', () => {
  assert.deepEqual(
    toFriendRegionPhotoRecords([
      normalizeFriendTravelMapItem(item(1, { images: [] })),
    ]),
    []
  );
  assert.equal(
    toFriendRegionPhotoRecords([normalizeFriendTravelMapItem(blurredItem(1))])
      .length,
    1
  );
});

test('a region name that does not match falls back to the coordinates', () => {
  const region = resolveFriendMapRegion({
    regionName: '존재하지않는지역',
    latitude: 37.5665,
    longitude: 126.978,
  });

  assert.ok(region);
  assert.equal(region.name, findProvinceByCoordinates(37.5665, 126.978)?.name);
});

test('a region with neither a matching name nor coordinates is not painted', () => {
  assert.equal(
    resolveFriendMapRegion({
      regionName: '존재하지않는지역',
      latitude: null,
      longitude: null,
    }),
    null
  );
  assert.deepEqual(
    toFriendRegionPhotoRecords([
      normalizeFriendTravelMapItem(
        blurredItem(1, {
          regionName: '존재하지않는지역',
          latitude: null,
          longitude: null,
        })
      ),
    ]),
    []
  );
});

test('coordinates outside Korea match no province', () => {
  assert.equal(findProvinceByCoordinates(0, 0), null);
  assert.equal(findProvinceByCoordinates(null, 126.9), null);
});

test('only regions that the name cannot resolve need a detail lookup', () => {
  assert.deepEqual(
    getUnresolvedFriendMapRegionIds([
      { regionId: 1, regionName: '서울특별시' },
      { regionId: 7, regionName: '존재하지않는지역' },
      { regionId: 7, regionName: '존재하지않는지역' },
    ]),
    [7]
  );
});
