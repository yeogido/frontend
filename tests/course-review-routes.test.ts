import assert from 'node:assert/strict';
import test from 'node:test';

import { getCourseReviewsPath } from '../src/pages/course-reviews/courseReviewRoute.ts';

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
