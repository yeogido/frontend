import assert from 'node:assert/strict';
import test from 'node:test';

import { mapCourseDetailToReviewCourse } from '../src/pages/review/reviewCourse.ts';

test('maps a course detail response into review-course card data', () => {
  const course = mapCourseDetailToReviewCourse({
    courseId: 3,
    courseType: 'OFFICIAL',
    title: '강릉 혼자 여행 코스',
    thumbnailUrl: 'https://example.com/course.png',
    description: '',
    tags: [],
    durationType: 'TWO_NIGHTS_THREE_DAYS',
    transportType: 'WALK',
    startMonth: 6,
    endMonth: 8,
    companionType: 'SOLO',
    isLiked: false,
    courseItems: [],
  });

  assert.deepEqual(course, {
    id: 3,
    title: '강릉 혼자 여행 코스',
    thumbnailUrl: 'https://example.com/course.png',
    duration: '2박 3일',
    transport: '뚜벅이 코스',
    companion: '혼자',
  });
});
