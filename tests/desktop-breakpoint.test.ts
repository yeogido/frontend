import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APP_MAX_WIDTH,
  DESKTOP_MIN_WIDTH,
  DESKTOP_SCALE,
} from '../src/constants/layout.ts';
import {
  DESKTOP_MEDIA_QUERY,
  getAppScale,
  isDesktopWidth,
} from '../src/utils/responsiveLayout.ts';

test('switches to the desktop layout at the breakpoint, not before', () => {
  assert.equal(isDesktopWidth(DESKTOP_MIN_WIDTH - 1), false);
  assert.equal(isDesktopWidth(DESKTOP_MIN_WIDTH), true);
  assert.equal(isDesktopWidth(1440), true);
});

test('keeps the existing mobile layout for phones and tablets', () => {
  assert.equal(isDesktopWidth(390), false);
  assert.equal(isDesktopWidth(768), false);
  assert.equal(isDesktopWidth(1023), false);
});

test('uses the same boundary for matchMedia as for the width check', () => {
  assert.equal(DESKTOP_MEDIA_QUERY, `(min-width: ${DESKTOP_MIN_WIDTH}px)`);
});

test('starts the desktop layout past the width where mobile scaling stops', () => {
  // APP_MAX_WIDTH 이후로는 scale이 더 커지지 않아 모바일 UI가 가운데 고정된다.
  // 그 지점보다 앞에서 데스크톱으로 넘어가면 두 레이아웃이 겹친다.
  assert.ok(DESKTOP_MIN_WIDTH > APP_MAX_WIDTH);
  assert.equal(getAppScale(DESKTOP_MIN_WIDTH), getAppScale(APP_MAX_WIDTH));
});

test('pins a fixed scale for desktop instead of growing with the viewport', () => {
  // 시안에서 읽은 비율(라벨 16→20 등). 뷰포트가 넓어져도 변하지 않아야
  // 데스크톱 화면이 모니터 크기에 따라 커지지 않는다.
  assert.equal(DESKTOP_SCALE, 20 / 16);
  assert.equal(getAppScale(DESKTOP_MIN_WIDTH), getAppScale(4000));
});

test('desktop routes use the same trailing slash and exact matching as the router', async () => {
  const { hasDesktopView } = await import('../src/constants/desktopRoutes.ts');
  assert.equal(hasDesktopView('/local-recommendation/course-info'), true);
  assert.equal(hasDesktopView('/local-recommendation/course-info/'), true);
  assert.equal(
    hasDesktopView('/local-recommendation/course-info/extra'),
    false
  );
  assert.equal(hasDesktopView('/local-course'), false);
});
