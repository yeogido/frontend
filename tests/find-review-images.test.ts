import assert from 'node:assert/strict';
import test from 'node:test';

import { findReviewImages } from '../src/pages/my-posts/utils/findReviewImages.ts';
import type { GetCourseReviewsResponse } from '../src/types/review.type.ts';

const author = {
  nickname: '민지',
  ageGroup: 'TWENTIES',
  gender: 'FEMALE',
  profileImageUrl: '',
};

const image = {
  imageKey: 'reviews/a.jpg',
  imageUrl: 'https://example.com/a.jpg',
  imageOrder: 1,
};

const preview = (reviewId: number, images = [image]) => ({
  reviewId,
  author,
  rating: 5,
  content: '내용',
  isMine: true,
  images,
  createdAt: '2026-08-01',
});

const page = (
  items: ReturnType<typeof preview>[],
  next?: { cursorValue: string; cursorId: number }
): GetCourseReviewsResponse => ({
  items,
  cursorValue: next?.cursorValue ?? null,
  cursorId: next?.cursorId ?? null,
  hasNext: Boolean(next),
});

test('finds the images of the requested review on the first page', async () => {
  const images = await findReviewImages(
    async () => page([preview(1), preview(2)]),
    2
  );

  assert.deepEqual(images, [image]);
});

test('follows the cursor until the review shows up', async () => {
  const requested: (string | undefined)[] = [];

  const images = await findReviewImages(async (cursor) => {
    requested.push(cursor?.cursorValue);

    return cursor
      ? page([preview(9)])
      : page([preview(1)], { cursorValue: '2026-08-01', cursorId: 1 });
  }, 9);

  assert.deepEqual(images, [image]);
  assert.deepEqual(requested, [undefined, '2026-08-01']);
});

test('gives up when the list ends without the review', async () => {
  const images = await findReviewImages(async () => page([preview(1)]), 99);

  assert.equal(images, undefined);
});

// 커서 둘 중 하나만 오면 다음 요청이 400이 된다. 그때는 더 따라가지 않는다.
test('stops when the response carries an incomplete cursor', async () => {
  let calls = 0;

  const images = await findReviewImages(async () => {
    calls++;

    return { ...page([preview(1)]), hasNext: true, cursorId: null };
  }, 99);

  assert.equal(images, undefined);
  assert.equal(calls, 1);
});

test('reads a review that has no images as an empty list', async () => {
  const images = await findReviewImages(async () => page([preview(1, [])]), 1);

  assert.deepEqual(images, []);
});
