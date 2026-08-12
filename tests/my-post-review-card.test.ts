import assert from 'node:assert/strict';
import test from 'node:test';

import { toMyPostReviewCardProps } from '../src/pages/my-posts/utils/myPostReviewCard.ts';
import type { MyCourseSummary, MyReview } from '../src/types/user.type.ts';

const course: MyCourseSummary = {
  id: 15,
  title: '강릉 혼자 여행 코스',
  thumbnailUrl: 'https://example.com/course.png',
  durationType: 'TWO_NIGHT',
  transportType: 'PUBLIC',
  companionType: 'FRIEND',
  hashtags: ['바다'],
};

const review: MyReview = {
  reviewId: 39,
  reviewerName: '민지',
  reviewerProfileImage: 'https://example.com/profile.png',
  ageGroup: 'TWENTIES',
  gender: 'FEMALE',
  rating: 5,
  content: '지도 동선이 편했어요',
  createdAt: '2026-08-09T10:00:00',
  images: [
    {
      imageKey: 'reviews/second.jpg',
      imageUrl: 'https://example.com/second.jpg',
      imageOrder: 2,
    },
    {
      imageKey: 'reviews/first.jpg',
      imageUrl: 'https://example.com/first.jpg',
      imageOrder: 1,
    },
  ],
};

test('uses the first review photo as the card thumbnail', () => {
  // 응답이 순서대로 온다는 보장이 없어 imageOrder 기준으로 정렬한 첫 장이다.
  const cardProps = toMyPostReviewCardProps(review, course);

  assert.equal(cardProps.image, 'https://example.com/first.jpg');
  assert.deepEqual(cardProps.images, [
    'https://example.com/first.jpg',
    'https://example.com/second.jpg',
  ]);
});

test('falls back to the course thumbnail when the review has no photo', () => {
  // 서버가 사진 0장인 후기를 허용한다.
  const cardProps = toMyPostReviewCardProps({ ...review, images: [] }, course);

  assert.equal(cardProps.image, 'https://example.com/course.png');
  assert.deepEqual(cardProps.images, []);
});

test('leaves the thumbnail empty when neither photo nor course is known', () => {
  const cardProps = toMyPostReviewCardProps({ ...review, images: [] });

  assert.equal(cardProps.image, '');
  assert.equal(cardProps.courseId, undefined);
});

test('carries image keys so the editor can keep existing photos', () => {
  // imageKey 없이 저장하면 PATCH의 images가 전체 교체라 서버 사진이 지워진다.
  assert.deepEqual(toMyPostReviewCardProps(review, course).editableImages, [
    {
      imageKey: 'reviews/first.jpg',
      imageUrl: 'https://example.com/first.jpg',
    },
    {
      imageKey: 'reviews/second.jpg',
      imageUrl: 'https://example.com/second.jpg',
    },
  ]);
});
