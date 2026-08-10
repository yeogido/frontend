import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSavedTravelRecordId,
  getSavedTravelRecordState,
} from '../src/pages/travel-record/utils/savedTravelRecord.ts';

test('reads the saved travel record id from navigation state', () => {
  const state = { savedTravelRecordId: '43', savedTravelRecordYear: 2025 };

  assert.equal(getSavedTravelRecordId(state), '43');
  assert.deepEqual(getSavedTravelRecordState(state), { id: '43', year: 2025 });
});

test('ignores navigation state without a valid saved travel record id', () => {
  assert.equal(getSavedTravelRecordId(null), null);
  assert.equal(getSavedTravelRecordId({ savedTravelRecordId: 43 }), null);
  assert.equal(
    getSavedTravelRecordState({ savedTravelRecordId: '43', savedTravelRecordYear: '2025' }),
    null,
  );
});
