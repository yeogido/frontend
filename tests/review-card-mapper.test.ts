import assert from 'node:assert/strict';
import test from 'node:test';

import {
  toReviewCardProps,
  toReviewCourseCardProps,
} from '../src/utils/reviewCard.ts';

const author = {
  nickname: '민지',
  ageGroup: 'TWENTIES',
  profileImageUrl: 'https://example.com/profile.png',
};

test('maps a recent review into review card props', () => {
  const card = toReviewCardProps({
    reviewId: 101,
    content: '지도 동선이 너무 편했어요.',
    rating: 5,
    createdAt: '2026-07-05T15:30:00',
    images: [
      { imageUrl: 'https://example.com/b.jpg', imageOrder: 2 },
      { imageUrl: 'https://example.com/a.jpg', imageOrder: 1 },
    ],
    author,
  });

  assert.deepEqual(card, {
    id: 101,
    // imageOrder 순으로 정렬된다.
    images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    profileImage: 'https://example.com/profile.png',
    nickname: '민지',
    meta: '20대',
    content: '지도 동선이 너무 편했어요.',
    rating: 5,
    isMine: false,
  });
});

test('carries course title and id through when the response includes a course', () => {
  const card = toReviewCardProps({
    reviewId: 101,
    content: '내용',
    rating: 5,
    createdAt: '2026-07-05T15:30:00',
    images: [],
    author,
    course: {
      courseId: 15,
      title: '강릉 혼자 여행 코스',
      thumbnailUrl: '',
      durationType: 'TWO_NIGHT',
      transportType: 'CAR',
      isLiked: false,
    },
  });

  assert.equal(card.courseTitle, '강릉 혼자 여행 코스');
  assert.equal(card.courseId, 15);
});

test('omits course fields when the response has no course', () => {
  const card = toReviewCardProps({
    reviewId: 101,
    content: '내용',
    rating: 5,
    createdAt: '2026-07-05T15:30:00',
    images: [],
    author,
  });

  assert.ok(!('courseTitle' in card));
  assert.ok(!('courseId' in card));
});

test('marks a recent review as mine when its id is in my review ids', () => {
  const review = {
    reviewId: 101,
    content: '내 후기',
    rating: 5,
    createdAt: '2026-07-05T15:30:00',
    images: [],
    author,
  };

  assert.equal(toReviewCardProps(review, new Set([101])).isMine, true);
  assert.equal(toReviewCardProps(review, new Set([102])).isMine, false);
});

test('includes the course title when the review list response provides course data', () => {
  const card = toReviewCardProps({
    reviewId: 102,
    content: 'Review content',
    rating: 5,
    createdAt: '2026-07-05T15:30:00',
    images: [],
    author,
    course: {
      courseId: 15,
      title: 'Gangneung solo course',
      thumbnailUrl: 'https://example.com/course.png',
      durationType: 'TWO_NIGHT',
      transportType: 'PUBLIC',
      isLiked: false,
    },
  });

  assert.equal(card.courseTitle, 'Gangneung solo course');
});

test('maps a review with course info into course review card props', () => {
  const card = toReviewCourseCardProps({
    reviewId: 101,
    content: '동선이 편했어요.',
    rating: 4,
    createdAt: '2026-07-05T15:30:00',
    images: [],
    author,
    course: {
      courseId: 15,
      title: '강릉 혼자 여행 코스',
      thumbnailUrl: 'https://example.com/course.png',
      durationType: 'TWO_NIGHT',
      transportType: 'PUBLIC',
      isLiked: true,
    },
  });

  assert.deepEqual(card, {
    id: 101,
    courseId: 15,
    isMine: false,
    image: 'https://example.com/course.png',
    images: [],
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '대중교통',
    profileImage: 'https://example.com/profile.png',
    nickname: '민지',
    meta: '20대',
    content: '동선이 편했어요.',
    rating: 4,
    liked: true,
  });
});

test('includes gender in the meta label once the API returns it', () => {
  const card = toReviewCardProps({
    reviewId: 1,
    content: '',
    rating: 5,
    createdAt: '2026-07-05T15:30:00',
    images: [],
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
  } as unknown as Parameters<typeof toReviewCardProps>[0]);

  assert.deepEqual(card.images, []);
  assert.equal(card.nickname, '');
  assert.equal(card.meta, '');
});
