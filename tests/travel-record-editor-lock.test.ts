import assert from 'node:assert/strict';
import test from 'node:test';

import { isTravelRecordEditorLocked } from '../src/pages/travel-record/folder-decoration/saveState.ts';

test('locks folder editing while a travel record is being saved', () => {
  assert.equal(isTravelRecordEditorLocked(true), true);
  assert.equal(isTravelRecordEditorLocked(false), false);
});
