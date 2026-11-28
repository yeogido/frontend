import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DESKTOP_VIEW_PATHS,
  hasDesktopView,
} from '../src/constants/desktopRoutes.ts';

test('matches the exact paths that have a desktop view', () => {
  assert.equal(hasDesktopView('/local-recommendation'), true);
  assert.equal(hasDesktopView('/local-recommendation/course-info'), true);
  assert.equal(hasDesktopView('/local-course'), true);
  assert.equal(hasDesktopView('/local-course/popular'), true);
});

test('matches parameterized paths for any id', () => {
  assert.equal(hasDesktopView('/local-course/detail/117'), true);
  assert.equal(hasDesktopView('/local-course/detail/9'), true);
  assert.equal(hasDesktopView('/local-course/detail/117/reviews'), true);
  assert.equal(hasDesktopView('/yeogido-course/detail/117/reviews'), true);
});

test('matches the travel record create and edit steps', () => {
  assert.equal(hasDesktopView('/travel-record/new'), true);
  assert.equal(hasDesktopView('/travel-record/date-selection'), true);
  assert.equal(hasDesktopView('/travel-record/photo-selection'), true);
  assert.equal(hasDesktopView('/travel-record/folder-decoration'), true);
  assert.equal(hasDesktopView('/travel-record/42/edit'), true);
  assert.equal(hasDesktopView('/travel-record/42/edit/date'), true);
  assert.equal(hasDesktopView('/travel-record/42/edit/photos'), true);
  assert.equal(hasDesktopView('/travel-record/42/edit/decorate'), true);
  assert.equal(hasDesktopView('/travel-record/42'), true);
});

test('does not match paths that only start the same way', () => {
  assert.equal(hasDesktopView('/local-course/detail/117/reviews/extra'), false);
  assert.equal(hasDesktopView('/local-course/detail'), false);
  assert.equal(hasDesktopView('/local-recommendation/other'), false);
  assert.equal(hasDesktopView('/local-course/popular/extra'), false);
});

test('keeps screens without a desktop design on the mobile frame', () => {
  assert.equal(
    hasDesktopView('/yeogido-course/detail/117/reviews/extra'),
    false
  );
  assert.ok(DESKTOP_VIEW_PATHS.length > 0);
});

test('matches the admin course desktop screens', () => {
  assert.equal(hasDesktopView('/admin/courses/detail/117'), true);
  assert.equal(
    hasDesktopView('/admin/course-registration/region-selection'),
    true
  );
  assert.equal(hasDesktopView('/admin/course-registration/visit-order'), true);
});

test('matches the business verification screen that has a desktop view', () => {
  assert.equal(hasDesktopView('/business-verification'), true);
  assert.equal(hasDesktopView('/business-verification/extra'), false);
});

test('matches the business promotion create and edit screens', () => {
  assert.equal(hasDesktopView('/business-promotion-registration'), true);
  assert.equal(hasDesktopView('/business-promotion-registration/7/edit'), true);
  assert.equal(hasDesktopView('/business-promotion-registration/7'), false);
});
