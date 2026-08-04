import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTravelRecordMapRecords,
  getTravelRecordMapYearQueries,
  getTravelRecordMapYears,
} from '../src/pages/travel-record/utils/mapAuth.ts';

test('does not expose cached travel records after logout', () => {
  assert.deepEqual(getTravelRecordMapYears(false, [2025, 2026]), []);
  assert.deepEqual(
    getTravelRecordMapRecords(false, [[{ travelRecordId: 1 }]]),
    [],
  );
});

test('disables every travel record year request after logout', () => {
  const queries = getTravelRecordMapYearQueries(false, [2025, 2026]);

  assert.equal(queries.length, 2);
  assert.ok(queries.every((query) => query.enabled === false));
});
