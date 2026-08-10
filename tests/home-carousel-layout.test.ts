import assert from 'node:assert/strict';
import test from 'node:test';

import { HOME_CAROUSEL_CARD_GAP } from '../src/pages/home/utils/homeCarouselLayout.ts';

test('uses the shared review-card gap for home carousels', () => {
  assert.equal(HOME_CAROUSEL_CARD_GAP, 12);
});
