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

test('keeps travel record creation routes in the mobile frame', () => {
  assert.equal(hasDesktopView('/travel-record/123'), true);
  for (const path of [
    '/travel-record/new',
    '/travel-record/date-selection',
    '/travel-record/photo-selection',
    '/travel-record/folder-decoration',
  ]) {
    assert.equal(hasDesktopView(path), false, path);
  }
  assert.equal(hasDesktopView('/travel-record/new/'), false);
  assert.equal(hasDesktopView('/TRAVEL-RECORD/NEW'), false);
});

test('does not match paths that only start the same way', () => {
  // 후기 목록은 데스크톱 시안이 없어서 모바일 프레임을 그대로 써야 한다.
  assert.equal(hasDesktopView('/local-course/detail/117/reviews'), false);
  assert.equal(hasDesktopView('/local-course/detail'), false);
  assert.equal(hasDesktopView('/local-recommendation/other'), false);
  assert.equal(hasDesktopView('/local-course/popular/extra'), false);
});

test('keeps screens without a desktop design on the mobile frame', () => {
  assert.equal(hasDesktopView('/yeogido-course/detail/117'), false);
  assert.equal(hasDesktopView('/admin/courses/detail/117'), false);
  assert.ok(DESKTOP_VIEW_PATHS.length > 0);
});
