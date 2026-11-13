import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createTravelRecordCreateRequest,
  mapTravelRecordDetailToFolder,
  mapTravelRecordSummaryToFolder,
} from '../src/pages/travel-record/mappers/travelRecordApiMapper.ts';
import type { TravelRecordDetailResponse } from '../src/types/travelRecord.type.ts';

const draft = {
  selectedRegion: {
    id: '2',
    regionId: 2,
    name: '부산',
    province: '부산',
    selectionName: '부산',
  },
  selectedDateRange: {
    startDate: new Date(2026, 7, 17),
    endDate: new Date(2026, 7, 18),
  },
  uploadedImages: [{ objectKey: 'travel-records/a.jpg' }],
  decorations: [],
};
const detail: TravelRecordDetailResponse = {
  travelRecordId: 20,
  title: '부산',
  regionId: 2,
  startDate: '2026-08-17',
  endDate: '2026-08-18',
  coverImageUrl: '',
  folderTheme: 'BASIC',
  createdAt: '',
  visibility: 'FRIENDS',
  version: 3,
  owner: { userId: 1, nickname: '생성자', profileImageUrl: null },
  participants: [{ userId: 2, nickname: '참여자', profileImageUrl: null }],
  permissions: {
    canEdit: true,
    canDelete: false,
    canLeave: true,
    canInvite: true,
    canLinkShare: false,
  },
};
test('creation sends the explicitly selected FRIENDS visibility', () => {
  assert.equal(
    createTravelRecordCreateRequest({ ...draft, visibility: 'FRIENDS' })
      .visibility,
    'FRIENDS'
  );
});
test('existing creation callers can still omit visibility for the server PRIVATE default', () => {
  assert.equal(createTravelRecordCreateRequest(draft).visibility, undefined);
});
test('detail mapping preserves real membership, permissions and version', () => {
  const folder = mapTravelRecordDetailToFolder(detail);
  assert.equal(folder.visibility, 'friends');
  assert.deepEqual(folder.owner, detail.owner);
  assert.deepEqual(folder.participants, detail.participants);
  assert.deepEqual(folder.permissions, detail.permissions);
  assert.equal(folder.version, 3);
});
test('summary mapping converts all server visibility values to UI values', () => {
  for (const visibility of ['PRIVATE', 'FRIENDS', 'PUBLIC'] as const) {
    assert.equal(
      mapTravelRecordSummaryToFolder({ ...detail, visibility }).visibility,
      visibility.toLowerCase()
    );
  }
});
test('missing permissions never infer invitation rights from membership or visibility', () => {
  assert.equal(
    mapTravelRecordDetailToFolder({ ...detail, permissions: undefined })
      .permissions,
    undefined
  );
});
