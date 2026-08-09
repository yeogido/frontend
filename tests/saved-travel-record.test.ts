import assert from 'node:assert/strict';
import test from 'node:test';

import { getSavedTravelRecordId } from '../src/pages/travel-record/utils/savedTravelRecord.ts';

test('reads the saved travel record id from navigation state', () => {
  assert.equal(getSavedTravelRecordId({ savedTravelRecordId: '43' }), '43');
});

test('ignores navigation state without a valid saved travel record id', () => {
  assert.equal(getSavedTravelRecordId(null), null);
  assert.equal(getSavedTravelRecordId({ savedTravelRecordId: 43 }), null);
});
