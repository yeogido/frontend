import assert from 'node:assert/strict';
import test from 'node:test';

import { recentReviewCourses } from '../src/pages/recent-review-courses/recentReviewCourses.ts';

test('recent review courses provides course and review details for each card', () => {
  assert.equal(recentReviewCourses.length, 4);
  assert.deepEqual(recentReviewCourses[0], {
    id: 'mukho-solo-trip',
    image: '',
    title: '묵호 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이',
    companion: '혼자',
    tags: ['summer', 'nature', 'sea'],
    profileImage: '',
    nickname: '민지',
    meta: '20대 여',
    content: '지도 동선이 너무 편했어요. 전시 포인트마다 사진 각이 딱 잡혔고, 야경까지 흐름이 좋아서 만족!',
    rating: 5,
    liked: false,
  });
});

test('recent review courses can display a four-star review', () => {
  assert.ok(recentReviewCourses.some((course) => course.rating === 4));
});
