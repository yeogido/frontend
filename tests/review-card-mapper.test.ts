import assert from 'node:assert/strict';
import test from 'node:test';

import {
  toReviewCardProps,
  toReviewCourseCardProps,
} from '../src/utils/reviewCard.ts';
import type { ReviewDetail } from '../src/types/review.type.ts';

const author = {
  nickname: '민지',
  ageGroup: 'TWENTIES',
  profileImageUrl: 'https://example.com/profile.png',
};

const course = {
  courseId: 15,
  title: '강릉 혼자 여행 코스',
  thumbnailUrl: 'https://example.com/course.png',
  durationType: 'TWO_NIGHT',
  transportType: 'PUBLIC',
  isLiked: true,
};

const review: ReviewDetail = {
  reviewId: 101,
  content: '지도 동선이 너무 편했어요.',
  rating: 4,
  createdAt: '2026-07-05T15:30:00',
  images: [
    { imageKey: 'reviews/b.jpg', imageUrl: 'https://example.com/b.jpg', imageOrder: 2 },
    { imageKey: 'reviews/a.jpg', imageUrl: 'https://example.com/a.jpg', imageOrder: 1 },
  ],
  author,
  course,
};

test('maps a review into review card props', () => {
  assert.deepEqual(toReviewCardProps(review), {
    id: 101,
    // imageOrder 순으로 정렬된다.
    images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    editableImages: [
      { imageKey: 'reviews/a.jpg', imageUrl: 'https://example.com/a.jpg' },
      { imageKey: 'reviews/b.jpg', imageUrl: 'https://example.com/b.jpg' },
    ],
    profileImage: 'https://example.com/profile.png',
    nickname: '민지',
    meta: '20대',
    content: '지도 동선이 너무 편했어요.',
    rating: 4,
    isMine: false,
    courseTitle: '강릉 혼자 여행 코스',
    courseId: 15,
  });
});

test('maps a review into course review card props', () => {
  assert.deepEqual(toReviewCourseCardProps(review), {
    id: 101,
    courseId: 15,
    isMine: false,
    // 카드에 그리는 건 코스 썸네일, images는 상세 모달용 후기 사진이다.
    image: 'https://example.com/course.png',
    images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    editableImages: [
      { imageKey: 'reviews/a.jpg', imageUrl: 'https://example.com/a.jpg' },
      { imageKey: 'reviews/b.jpg', imageUrl: 'https://example.com/b.jpg' },
    ],
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    // Swagger enum에는 없지만 실제로 내려오는 값이다.
    courseType: '대중교통',
    profileImage: 'https://example.com/profile.png',
    nickname: '민지',
    meta: '20대',
    content: '지도 동선이 너무 편했어요.',
    rating: 4,
    liked: true,
  });
});

test('marks a review as mine only when its id is in my review ids', () => {
  assert.equal(toReviewCardProps(review, new Set([101])).isMine, true);
  assert.equal(toReviewCardProps(review, new Set([102])).isMine, false);
  assert.equal(toReviewCourseCardProps(review, new Set([101])).isMine, true);
});

test('includes gender in the meta label once the API returns it', () => {
  const card = toReviewCardProps({
    ...review,
    author: { ...author, gender: 'FEMALE' },
  });

  assert.equal(card.meta, '20대 여');
});

test('survives a review whose author or images are missing', () => {
  const card = toReviewCardProps({
    reviewId: 2,
    content: '내용',
    rating: 3,
    createdAt: '2026-07-05T15:30:00',
    course,
  } as unknown as ReviewDetail);

  assert.deepEqual(card.images, []);
  assert.equal(card.nickname, '');
  assert.equal(card.meta, '');
});
