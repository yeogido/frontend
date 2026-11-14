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
  // 상세 화면은 아직 데스크톱 뷰가 없다.
  assert.equal(hasDesktopView('/travel-record/42'), false);
});

test('does not match paths that only start the same way', () => {
  // 후기 목록은 데스크톱 시안이 없어서 모바일 프레임을 그대로 써야 한다.
  assert.equal(hasDesktopView('/local-course/detail/117/reviews'), false);
  assert.equal(hasDesktopView('/local-course/detail'), false);
  assert.equal(hasDesktopView('/local-recommendation/other'), false);
  assert.equal(hasDesktopView('/local-course/popular/extra'), false);
});

test('keeps screens without a desktop design on the mobile frame', () => {
  assert.equal(hasDesktopView('/yeogido-course/detail/117/reviews'), false);
  assert.equal(hasDesktopView('/admin/courses/detail/117'), false);
  assert.ok(DESKTOP_VIEW_PATHS.length > 0);
});
