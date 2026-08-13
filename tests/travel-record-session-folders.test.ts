import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatTravelRecordLocalDate,
  getValidTravelRecordYear,
} from '../src/pages/travel-record/utils/sessionFolders.ts';

test('formats travel record dates in local calendar time', () => {
  assert.equal(
    formatTravelRecordLocalDate(new Date(2026, 6, 1)),
    '2026-07-01',
  );
});

test('selects an available year when the current travel record year disappears', () => {
  assert.equal(getValidTravelRecordYear([2026, 2025], 2024, 2026), 2026);
  assert.equal(getValidTravelRecordYear([2026, 2025], 2025, 2026), 2025);
  assert.equal(getValidTravelRecordYear([], 2025, 2026), 2026);
});
