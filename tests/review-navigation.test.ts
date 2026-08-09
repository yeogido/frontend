import assert from 'node:assert/strict';
import test from 'node:test';

import {
  readOpenedReview,
  toCourseDetailState,
} from '../src/utils/reviewNavigation.ts';

const review = {
  images: ['https://example.com/a.jpg'],
  content: '동선이 편했어요.',
  profileImage: 'https://example.com/profile.png',
  nickname: '민지',
  meta: '20대 여',
  rating: 4,
};

test('carries only the fields the detail modal needs', () => {
  const state = toCourseDetailState({ ...review, courseId: 15 } as never);

  assert.deepEqual(state, { openedReview: review });
});

test('reads back what it wrote', () => {
  assert.deepEqual(readOpenedReview(toCourseDetailState(review)), review);
});

// history state는 뒤로가기·새로고침을 거치며 남거나 사라지고 사용자가 조작할
// 수도 있어서, 모양을 확인한 뒤에만 쓴다.
test('ignores state that is missing or shaped differently', () => {
  assert.equal(readOpenedReview(undefined), undefined);
  assert.equal(readOpenedReview(null), undefined);
  assert.equal(readOpenedReview('열어줘'), undefined);
  assert.equal(readOpenedReview({}), undefined);
  assert.equal(readOpenedReview({ openedReview: null }), undefined);
  assert.equal(
    readOpenedReview({ openedReview: { ...review, content: 1 } }),
    undefined
  );
  assert.equal(
    readOpenedReview({ openedReview: { ...review, nickname: undefined } }),
    undefined
  );
});

// 모달이 images를 배열로 다뤄서(길이 확인 후 map) 배열이 아니면 렌더가 터진다.
test('drops images that are not an array', () => {
  const opened = readOpenedReview({
    openedReview: { ...review, images: 'a.jpg' },
  });

  assert.equal(opened?.images, undefined);
  assert.equal(opened?.content, review.content);
});

test('keeps a review that has no images', () => {
  const withoutImages = { ...review, images: undefined };

  assert.deepEqual(
    readOpenedReview({ openedReview: withoutImages }),
    withoutImages
  );
});
