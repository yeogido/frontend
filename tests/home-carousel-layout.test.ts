import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getHomeCarouselIndex,
  HOME_CAROUSEL_CARD_GAP,
} from '../src/pages/home/utils/homeCarouselLayout.ts';

test('uses the shared review-card gap for home carousels', () => {
  assert.equal(HOME_CAROUSEL_CARD_GAP, 12);
});

test('recalculates the active slide using the current scaled gap', () => {
  assert.equal(getHomeCarouselIndex(366, 342, 1, 3), 1);
});
