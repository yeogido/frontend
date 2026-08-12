import assert from 'node:assert/strict';
import test from 'node:test';

import { getCourseReviewsPath } from '../src/utils/courseReviewRoute.ts';
import { buildCourseDetailPath } from '../src/utils/routes.ts';

test('builds the review-list path for local courses', () => {
  assert.equal(
    getCourseReviewsPath('local-course', 42),
    '/local-course/detail/42/reviews'
  );
});

test('builds the review-list path for yeogido courses', () => {
  assert.equal(
    getCourseReviewsPath('yeogido-course', 24),
    '/yeogido-course/detail/24/reviews'
  );
});

test('routes a course to the detail page that matches its type', () => {
  assert.equal(buildCourseDetailPath('LOCAL', 42), '/local-course/detail/42');
  assert.equal(
    buildCourseDetailPath('OFFICIAL', 24),
    '/yeogido-course/detail/24'
  );
});

test('falls back to the yeogido detail page for an unknown course type', () => {
  // 각 상세 페이지는 자기 타입이 아닌 코스를 NotFound로 처리한다. 값이
  // 비거나 모르는 값이면 기본 라우트로 보내고 그쪽에서 판정하게 둔다.
  assert.equal(buildCourseDetailPath('', 7), '/yeogido-course/detail/7');
});
