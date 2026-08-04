import assert from 'node:assert/strict';
import test from 'node:test';

import { isReviewFormValid } from '../src/pages/review/reviewForm.ts';

test('requires a rating between one and five', () => {
  assert.equal(
    isReviewFormValid({ rating: 0, review: '후기', photoCount: 1 }),
    false
  );
  assert.equal(
    isReviewFormValid({ rating: 5, review: '후기', photoCount: 1 }),
    true
  );
  assert.equal(
    isReviewFormValid({ rating: 6, review: '후기', photoCount: 1 }),
    false
  );
});

test('requires both a photo and comment to enable review submission', () => {
  assert.equal(
    isReviewFormValid({ rating: 5, review: '', photoCount: 1 }),
    false
  );
  assert.equal(
    isReviewFormValid({ rating: 5, review: '후기', photoCount: 0 }),
    false
  );
  assert.equal(
    isReviewFormValid({ rating: 5, review: '후기', photoCount: 1 }),
    true
  );
  assert.equal(
    isReviewFormValid({ rating: 5, review: 'a'.repeat(301), photoCount: 1 }),
    false
  );
});
