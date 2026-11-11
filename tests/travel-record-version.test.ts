import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createTravelRecordUpdateRequest,
  mapTravelRecordDetailToFolder,
} from '../src/pages/travel-record/mappers/travelRecordApiMapper.ts';

const updateDraft = {
  selectedRegion: {
    id: '139',
    regionId: 139,
    name: '강릉시',
    province: '강원',
    selectionName: '강릉시',
  },
  selectedDateRange: {
    startDate: new Date(2026, 7, 21),
    endDate: new Date(2026, 7, 21),
  },
  uploadedImages: [{ objectKey: 'travel-records/existing.jpeg' }],
  decorations: [],
  isStickerStateRestored: true,
};

test('detail mapping preserves the exact edit version including zero', () => {
  for (const version of [0, 7]) {
    const folder = mapTravelRecordDetailToFolder({
      travelRecordId: 46,
      title: '강릉시',
      regionId: 139,
      startDate: '2026-08-21',
      endDate: '2026-08-21',
      coverImageUrl: '',
      folderTheme: 'BASIC',
      images: [],
      stickers: [],
      createdAt: '',
      version,
    });
    assert.equal(folder.version, version);
  }
});

test('update body sends the version loaded for this editing session', () => {
  for (const version of [0, 7]) {
    assert.equal(
      createTravelRecordUpdateRequest({ ...updateDraft, version }).version,
      version
    );
  }
});

test('a missing or invalid edit version is rejected instead of defaulting to zero', () => {
  for (const version of [undefined, null, -1, 1.5, NaN]) {
    assert.throws(
      () =>
        createTravelRecordUpdateRequest({
          ...updateDraft,
          version: version as number,
        }),
      /수정 버전/
    );
  }
});
