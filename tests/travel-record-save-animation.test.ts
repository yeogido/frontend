import assert from 'node:assert/strict';
import test from 'node:test';

import { SAVE_SUCCESS_ANIMATION_MS } from '../src/pages/travel-record/folder-decoration/saveAnimation.ts';

test('keeps the saved folder completion animation brief before navigation', () => {
  assert.equal(SAVE_SUCCESS_ANIMATION_MS, 480);
});
