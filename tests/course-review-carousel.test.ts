import assert from 'node:assert/strict';
import test from 'node:test';

import { REVIEW_CAROUSEL_CLASS_NAME } from '../src/pages/detail/utils/reviewCarouselStyle.ts';

test('keeps a course review carousel horizontally scrollable without vertical scrolling', () => {
  assert.match(REVIEW_CAROUSEL_CLASS_NAME, /overflow-x-auto/);
  assert.match(REVIEW_CAROUSEL_CLASS_NAME, /overflow-y-hidden/);
});
