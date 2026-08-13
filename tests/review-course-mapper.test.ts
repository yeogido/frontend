import assert from 'node:assert/strict';
import test from 'node:test';

import { mapCourseSummaryToReviewCourse } from '../src/pages/review/mappers/reviewCourse.ts';

test('maps a course summary response into review-course card data', () => {
  const course = mapCourseSummaryToReviewCourse({
    courseId: 3,
    title: '강릉 혼자 여행 코스',
    thumbnailUrl: 'https://example.com/course.png',
    // Swagger의 CourseSummaryResponse.durationType enum 값을 쓴다.
    // (별칭 표기는 course-enum-labels.test.ts가 따로 검증한다)
    durationType: 'TWO_NIGHT',
    transportType: 'WALK',
    companionType: 'SOLO',
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

test('drops an empty thumbnail so the card can fall back to a placeholder', () => {
  const course = mapCourseSummaryToReviewCourse({
    courseId: 4,
    title: '부산 바다 코스',
    thumbnailUrl: '',
    durationType: 'DAY_TRIP',
    transportType: 'CAR',
    companionType: 'FRIEND',
  });

  assert.equal(course.thumbnailUrl, undefined);
});
