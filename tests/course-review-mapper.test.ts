import assert from 'node:assert/strict';
import test from 'node:test';

import { mapCourseReviewPreviews } from '../src/pages/detail/mappers/courseReviewMapper.ts';

test('maps course review previews into review card data', () => {
  const reviews = mapCourseReviewPreviews([
    {
      reviewId: 7,
      author: {
        nickname: '민지',
        ageGroup: 'TWENTIES',
        profileImageUrl: 'https://example.com/profile.png',
      },
      rating: 5,
      content: '동선이 편하고 장소 구성이 좋았어요.',
      imageUrls: ['https://example.com/a.jpg'],
      createdAt: '2026-07-26',
    },
  ]);

  assert.deepEqual(reviews, [
    {
      id: 7,
      images: ['https://example.com/a.jpg'],
      profileImage: 'https://example.com/profile.png',
      nickname: '민지',
      meta: '20대',
      content: '동선이 편하고 장소 구성이 좋았어요.',
      rating: 5,
      isMine: false,
    },
  ]);
});

test('treats a missing review list as empty', () => {
  assert.deepEqual(mapCourseReviewPreviews(undefined), []);
});

test('marks a review as mine only when its id is in my review ids', () => {
  const previews = [
    {
      reviewId: 1,
      author: { nickname: '나', ageGroup: 'TEENS', profileImageUrl: '' },
      rating: 4,
      content: '내 후기',
      imageUrls: [],
      createdAt: '2026-07-26',
    },
    {
      reviewId: 2,
      author: { nickname: '남', ageGroup: 'TEENS', profileImageUrl: '' },
      rating: 4,
      content: '남의 후기',
      imageUrls: [],
      createdAt: '2026-07-26',
    },
  ];

  const reviews = mapCourseReviewPreviews(previews, new Set([1]));

  assert.equal(reviews[0].isMine, true);
  assert.equal(reviews[1].isMine, false);
});

test('marks nothing as mine when the id set is not given', () => {
  const [review] = mapCourseReviewPreviews([
    {
      reviewId: 1,
      author: { nickname: '나', ageGroup: 'TEENS', profileImageUrl: '' },
      rating: 4,
      content: '내용',
      imageUrls: [],
      createdAt: '2026-07-26',
    },
  ]);

  assert.equal(review.isMine, false);
});
