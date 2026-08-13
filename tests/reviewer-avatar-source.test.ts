import assert from 'node:assert/strict';
import test from 'node:test';

import { getReviewerAvatarSource } from '../src/components/common/reviewerAvatarSource.ts';

test('uses the current profile image for my review', () => {
  assert.equal(
    getReviewerAvatarSource({
      reviewImageUrl: 'https://example.com/previous.jpg',
      isMine: true,
      currentProfileImageUrl: 'https://example.com/current.jpg',
    }),
    'https://example.com/current.jpg'
  );
});

test('keeps the review author image for another user', () => {
  assert.equal(
    getReviewerAvatarSource({
      reviewImageUrl: 'https://example.com/other.jpg',
      isMine: false,
      currentProfileImageUrl: 'https://example.com/current.jpg',
    }),
    'https://example.com/other.jpg'
  );
});
