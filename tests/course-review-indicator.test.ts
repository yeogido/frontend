import assert from 'node:assert/strict';
import test from 'node:test';

import { getReviewCarouselIndicatorSize } from '../src/components/common/reviewCarouselIndicator.ts';

test('uses only the visible indicator width so adjacent indicators stay close together', () => {
  assert.deepEqual(getReviewCarouselIndicatorSize(true, 1), {
    width: 20,
    height: 4,
  });
  assert.deepEqual(getReviewCarouselIndicatorSize(false, 1), {
    width: 4,
    height: 4,
  });
});
