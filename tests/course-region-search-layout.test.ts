import assert from 'node:assert/strict';
import test from 'node:test';

import { getCitySelectionMarginTop } from '../src/pages/course-region-search/utils/layout.ts';

test('moves the city selection into the recent-search title position when no searches remain', () => {
  assert.equal(getCitySelectionMarginTop(false), 24);
  assert.equal(getCitySelectionMarginTop(true), 32);
});
