import assert from 'node:assert/strict';
import test from 'node:test';

import type { TravelRecordFolder } from '../src/pages/travel-record/types';
import {
  applyTravelRecordSessionChanges,
  getTravelRecordYears,
} from '../src/pages/travel-record/utils/sessionFolders.ts';

const createFolder = (id: string, title: string): TravelRecordFolder => ({
  id,
  regionCode: id,
  regionName: title,
  title,
  year: 2026,
  startDate: '2026-07-01',
  period: '07.01 - 07.02',
  photos: ['photo'],
  decorations: [],
});

test('applies session edits and deletions to mock travel folders', () => {
  const originalFolders = [createFolder('busan', '부산광역시'), createFolder('yeosu', '여수시')];
  const editedBusan = { ...originalFolders[0], title: '수정한 부산광역시' };

  const folders = applyTravelRecordSessionChanges(
    originalFolders,
    { busan: editedBusan },
    new Set(['yeosu']),
  );

  assert.deepEqual(folders, [editedBusan]);
});

test('uses the session-edited folders to build selectable travel years', () => {
  const folders = [
    createFolder('busan', '부산광역시'),
    { ...createFolder('yeosu', '여수시'), year: 2025 },
  ];

  assert.deepEqual(getTravelRecordYears(folders), [2026, 2025]);
});
