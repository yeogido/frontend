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

test('requires a comment but not a photo', () => {
  assert.equal(
    isReviewFormValid({ rating: 5, review: '', photoCount: 1 }),
    false
  );
  // 사진은 선택이다. 서버도 최소 개수를 두지 않는다.
  assert.equal(
    isReviewFormValid({ rating: 5, review: '후기', photoCount: 0 }),
    true
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

test('accepts only an integer photo count between zero and the maximum', () => {
  assert.equal(
    isReviewFormValid({ rating: 5, review: 'valid review', photoCount: -1 }),
    false
  );
  assert.equal(
    isReviewFormValid({ rating: 5, review: 'valid review', photoCount: 0.5 }),
    false
  );
  assert.equal(
    isReviewFormValid({ rating: 5, review: 'valid review', photoCount: 6 }),
    false
  );
});
