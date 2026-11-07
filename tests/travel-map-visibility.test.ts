import assert from 'node:assert/strict';
import test from 'node:test';
import { getTravelRecordRegionPhotoRecords } from '../src/pages/travel-record/utils/regionPhotoRecords.ts';
import {
  getTravelMapYears,
  filterTravelMapFoldersByYear,
} from '../src/pages/travel-record/utils/mapYears.ts';
import type { TravelRecordFolder } from '../src/pages/travel-record/types.ts';
import { mapTravelRecordFolder } from '../src/pages/travel-record/mappers/travelRecordApiMapper.ts';
import type { TravelRecordSummary } from '../src/types/travelRecord.type.ts';

const folder = (
  id: string,
  visibility?: TravelRecordFolder['visibility'],
  startDate = '2025-01-01'
): TravelRecordFolder => ({
  id,
  visibility,
  startDate,
  regionCode: '26',
  regionName: '부산광역시',
  title: id,
  period: '01.01',
  photos: [`https://example.test/${id}.jpg`],
  decorations: [],
});

test('map years start with the current year and descend through gaps', () => {
  assert.deepEqual(
    getTravelMapYears([2023, 2025, 2025, 2028, NaN], 2026),
    [2026, 2025, 2024, 2023]
  );
  assert.deepEqual(getTravelMapYears([], 2026), [2026]);
});

test('all years keeps every record and a selected year filters the map', () => {
  const folders = [
    folder('old', 'public', '2023-01-01'),
    folder('new', 'private', '2026-01-01'),
  ];
  assert.deepEqual(filterTravelMapFoldersByYear(folders, null), folders);
  assert.deepEqual(
    filterTravelMapFoldersByYear(folders, 2023).map(({ id }) => id),
    ['old']
  );
  assert.deepEqual(filterTravelMapFoldersByYear(folders, 2024), []);
});

test('the owner sees clear photos for every visibility', () => {
  for (const visibility of [
    'public',
    'friends',
    'private',
    undefined,
  ] as const) {
    const [photo] = getTravelRecordRegionPhotoRecords(
      [folder('own', visibility)],
      'owner'
    );
    assert.equal(Boolean(photo.isBlurred), false);
    assert.equal(photo.folderId, 'own');
  }
});

test('shared viewers see only public photos clearly and cannot open blurred folders', () => {
  for (const visibility of [
    'public',
    'friends',
    'private',
    undefined,
  ] as const) {
    const [photo] = getTravelRecordRegionPhotoRecords(
      [folder('shared', visibility)],
      'shared'
    );
    assert.equal(Boolean(photo.isBlurred), visibility !== 'public');
    assert.equal(photo.folderId, visibility === 'public' ? 'shared' : '');
    assert.equal(photo.regionName, '부산광역시');
    assert.equal(
      photo.photoUrl === 'https://example.test/shared.jpg',
      visibility === 'public'
    );
  }
});

test('the latest visit remains the representative photo across all years', () => {
  const photos = getTravelRecordRegionPhotoRecords(
    [
      folder('old', 'public', '2024-01-01'),
      folder('new', 'private', '2026-01-01'),
    ],
    'shared'
  );
  assert.equal(photos.length, 1);
  assert.equal(photos[0].isBlurred, true);
  assert.doesNotMatch(photos[0].photoUrl, /new.jpg/);
});

test('a restricted visit stays visible even when no source thumbnail is provided', () => {
  const restricted = {
    ...folder('hidden', 'private'),
    photos: [''] as [string],
  };
  const photos = getTravelRecordRegionPhotoRecords([restricted], 'shared');
  assert.equal(photos.length, 1);
  assert.equal(photos[0].regionName, '부산광역시');
  assert.equal(photos[0].isBlurred, true);
  assert.ok(photos[0].photoUrl);
  assert.equal(photos[0].folderId, '');
});

test('uses a separate processed thumbnail without passing along the private original', () => {
  const restricted = {
    ...folder('hidden', 'private'),
    sharedThumbnailUrl: 'https://example.test/blurred-preview.jpg',
  };
  const [sharedPhoto] = getTravelRecordRegionPhotoRecords(
    [restricted],
    'shared'
  );
  assert.equal(sharedPhoto.photoUrl, restricted.sharedThumbnailUrl);
  assert.equal(sharedPhoto.isBlurred, true);
  assert.doesNotMatch(JSON.stringify(sharedPhoto), /hidden.jpg/);
  const [ownPhoto] = getTravelRecordRegionPhotoRecords([restricted], 'owner');
  assert.equal(ownPhoto.photoUrl, restricted.photos[0]);
});

test('detail hydration preserves summary visibility unless the detail supplies a new value', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 1,
    title: '부산',
    regionId: 26,
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    coverImageUrl: 'https://example.test/photo.jpg',
    folderTheme: 'BASIC',
    createdAt: '',
    visibility: 'public',
  };
  const detail = { ...summary, visibility: undefined };
  assert.equal(mapTravelRecordFolder(summary, detail).visibility, 'public');
  assert.equal(
    mapTravelRecordFolder(summary, { ...detail, visibility: 'private' })
      .visibility,
    'private'
  );
});
