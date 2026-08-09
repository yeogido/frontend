import assert from 'node:assert/strict';
import test from 'node:test';

import { mapCourseReviewPreviews } from '../src/pages/detail/mappers/courseReviewMapper.ts';

const author = {
  nickname: '민지',
  ageGroup: 'TWENTIES',
  gender: 'FEMALE',
  profileImageUrl: 'https://example.com/profile.png',
};

const otherAuthor = {
  nickname: '나',
  ageGroup: 'TEENS',
  gender: 'NONE',
  profileImageUrl: '',
};

test('maps course review previews into review card data', () => {
  const reviews = mapCourseReviewPreviews([
    {
      reviewId: 7,
      author,
      rating: 5,
      content: '동선이 편하고 장소 구성이 좋았어요.',
      isMine: false,
      images: [
        {
          imageKey: 'courses/b.jpg',
          imageUrl: 'https://example.com/b.jpg',
          imageOrder: 2,
        },
        {
          imageKey: 'courses/a.jpg',
          imageUrl: 'https://example.com/a.jpg',
          imageOrder: 1,
        },
      ],
      createdAt: '2026-07-26',
    },
  ]);

  assert.deepEqual(reviews, [
    {
      id: 7,
      // imageOrder 순으로 정렬된다.
      images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
      // 수정 화면이 유지할 사진을 지목하는 데 쓴다.
      editableImages: [
        { imageKey: 'courses/a.jpg', imageUrl: 'https://example.com/a.jpg' },
        { imageKey: 'courses/b.jpg', imageUrl: 'https://example.com/b.jpg' },
      ],
      profileImage: 'https://example.com/profile.png',
      nickname: '민지',
      meta: '20대 여',
      content: '동선이 편하고 장소 구성이 좋았어요.',
      rating: 5,
      isMine: false,
    },
  ]);
});

test('treats a missing review list as empty', () => {
  assert.deepEqual(mapCourseReviewPreviews(undefined), []);
});

test('takes isMine from the response', () => {
  const reviews = mapCourseReviewPreviews([
    {
      reviewId: 1,
      author: otherAuthor,
      rating: 4,
      content: '내 후기',
      isMine: true,
      images: [],
      createdAt: '2026-07-26',
    },
    {
      reviewId: 2,
      author: { ...otherAuthor, nickname: '남' },
      rating: 4,
      content: '남의 후기',
      isMine: false,
      images: [],
      createdAt: '2026-07-26',
    },
  ]);

  assert.equal(reviews[0].isMine, true);
  assert.equal(reviews[1].isMine, false);
});
