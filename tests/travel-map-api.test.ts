import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mapTravelMapRecordToFolder,
  getUnresolvedTravelMapRegionIds,
} from '../src/pages/travel-record/mappers/travelMapMapper.ts';
import { getTravelMapQueryKey } from '../src/pages/travel-record/utils/mapAuth.ts';
import { filterTravelMapFoldersByYear } from '../src/pages/travel-record/utils/mapYears.ts';
import type { TravelRecordMapItem } from '../src/types/travelRecord.type.ts';

const record = (
  overrides: Partial<TravelRecordMapItem> = {}
): TravelRecordMapItem => ({
  travelRecordId: 20,
  title: '새해 부산 여행',
  regionId: 2,
  regionName: '부산광역시',
  latitude: 35.1796,
  longitude: 129.0756,
  startDate: '2025-12-31',
  endDate: '2026-01-02',
  visibility: 'FRIENDS',
  images: [
    {
      imageId: 2,
      imageKey: 'second.jpg',
      imageUrl: 'https://example.test/second.jpg',
      imageOrder: 2,
    },
    {
      imageId: 1,
      imageKey: 'first.jpg',
      imageUrl: 'https://example.test/first.jpg',
      imageOrder: 1,
    },
  ],
  ...overrides,
});

test('map DTO supplies ordered photos and normalized visibility without album detail', () => {
  const item = record();
  const folder = mapTravelMapRecordToFolder(item);
  assert.equal(folder.regionCode, '26');
  assert.equal(folder.id, '20');
  assert.equal(folder.visibility, 'friends');
  assert.deepEqual(folder.photos, [
    'https://example.test/first.jpg',
    'https://example.test/second.jpg',
  ]);
  assert.equal(item.images[0].imageOrder, 2);
  assert.deepEqual(folder.decorations, []);
});

test('each API visibility maps explicitly to the UI visibility', () => {
  assert.equal(
    mapTravelMapRecordToFolder(record({ visibility: 'PRIVATE' })).visibility,
    'private'
  );
  assert.equal(
    mapTravelMapRecordToFolder(record({ visibility: 'FRIENDS' })).visibility,
    'friends'
  );
  assert.equal(
    mapTravelMapRecordToFolder(record({ visibility: 'PUBLIC' })).visibility,
    'public'
  );
});

test('records without both finite coordinates remain data but cannot fill a map region', () => {
  for (const coordinates of [
    { latitude: null },
    { longitude: null },
    { latitude: NaN },
    { longitude: Infinity },
  ]) {
    const folder = mapTravelMapRecordToFolder(record(coordinates));
    assert.equal(folder.id, '20');
    assert.equal(folder.regionCode, '');
  }
});

test('region lookup is needed only for unresolved regions with usable coordinates', () => {
  assert.deepEqual(
    getUnresolvedTravelMapRegionIds([
      record(),
      record({ regionId: 3, regionName: '고성군' }),
      record({ regionId: 3, regionName: '고성군' }),
      record({ regionId: 4, regionName: '알 수 없는 지역', latitude: null }),
    ]),
    [3]
  );
  const folder = mapTravelMapRecordToFolder(
    record({ regionId: 3, regionName: '고성군' }),
    {
      name: '고성군',
      fullName: '강원특별자치도 고성군',
    }
  );
  assert.ok(folder.regionCode.startsWith('42'));
});

test('map year filter follows endDate for trips crossing New Year', () => {
  const folder = mapTravelMapRecordToFolder(record());
  assert.deepEqual(filterTravelMapFoldersByYear([folder], 2025), []);
  assert.deepEqual(filterTravelMapFoldersByYear([folder], 2026), [folder]);
});

test('map cache keys separate accounts, sessions and year filters', () => {
  const base = getTravelMapQueryKey(1, 0, { year: 2026 });
  assert.notDeepEqual(base, getTravelMapQueryKey(2, 0, { year: 2026 }));
  assert.notDeepEqual(base, getTravelMapQueryKey(1, 1, { year: 2026 }));
  assert.notDeepEqual(base, getTravelMapQueryKey(1, 0, { year: 2025 }));
  assert.notDeepEqual(
    base,
    getTravelMapQueryKey(1, 0, { year: 2026, visibility: 'PUBLIC' })
  );
});
