import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearPhotoDraftAfterTravelRecordSave,
  isTravelRecordEditorLocked,
} from '../src/pages/travel-record/folder-decoration/saveState.ts';

test('locks folder editing while a travel record is being saved', () => {
  assert.equal(isTravelRecordEditorLocked(true), true);
  assert.equal(isTravelRecordEditorLocked(false), false);
});

test('does not turn a successful server save into a failure when draft cleanup fails', async () => {
  const cleared = await clearPhotoDraftAfterTravelRecordSave(async () => {
    throw new Error('IndexedDB unavailable');
  });

  assert.equal(cleared, false);
});
