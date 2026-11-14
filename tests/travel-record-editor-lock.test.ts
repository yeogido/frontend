import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearPhotoDraftAfterTravelRecordSave,
  isTravelRecordEditorLocked,
  acquireTravelRecordSave,
  releaseTravelRecordSave,
  isTravelRecordSaving,
  subscribeToTravelRecordSave,
} from '../src/pages/travel-record/folder-decoration/saveState.ts';

test('locks folder editing while a travel record is being saved', () => {
  assert.equal(isTravelRecordEditorLocked(true), true);
  assert.equal(isTravelRecordEditorLocked(false), false);
});

test('shares the save lock and only its owner can release it', () => {
  const changes: boolean[] = [];
  const unsubscribe = subscribeToTravelRecordSave(() =>
    changes.push(isTravelRecordSaving())
  );
  const owner = acquireTravelRecordSave();
  assert.ok(owner);
  assert.equal(acquireTravelRecordSave(), null);
  releaseTravelRecordSave(Symbol('other'));
  assert.equal(isTravelRecordSaving(), true);
  releaseTravelRecordSave(owner);
  assert.equal(isTravelRecordSaving(), false);
  assert.deepEqual(changes, [true, false]);
  unsubscribe();
});

test('does not turn a successful server save into a failure when draft cleanup fails', async () => {
  const cleared = await clearPhotoDraftAfterTravelRecordSave(async () => {
    throw new Error('IndexedDB unavailable');
  });

  assert.equal(cleared, false);
});
