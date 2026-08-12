import assert from 'node:assert/strict';
import test from 'node:test';

import { getReviewerNameLabel } from '../src/components/common/reviewerNameLabel.ts';

test('keeps up to three name characters without an ellipsis', () => {
  assert.deepEqual(getReviewerNameLabel('민지'), {
    text: '민지',
    isTruncated: false,
  });
  assert.deepEqual(getReviewerNameLabel('여기도'), {
    text: '여기도',
    isTruncated: false,
  });
});

test('shows only three name characters before a compact ellipsis', () => {
  assert.deepEqual(getReviewerNameLabel('긴이름작성자'), {
    text: '긴이름',
    isTruncated: true,
  });
});
