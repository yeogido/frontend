import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop course list only');
  void page;
});

test('restores distance sort from the URL and requests courses with coordinates', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 37.5, longitude: 127.0 });
  let courseUrl = '';
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v1/courses') courseUrl = url.toString();
    await route.fulfill({
      json: {
        result: { items: [], hasNext: false, cursorId: 0, cursorValue: '' },
      },
    });
  });
  await page.goto('/local-course?sort=' + encodeURIComponent('거리순'));
  await expect.poll(() => courseUrl).not.toBe('');
  const params = new URL(courseUrl).searchParams;
  expect(params.get('sort')).toBe('DISTANCE');
  expect(params.get('latitude')).toBe('37.5');
  expect(params.get('longitude')).toBe('127');
  await expect(page.getByText('조건에 맞는 코스가 없어요.')).toBeVisible();
});

test('stops automatically fetching after the next page fails', async ({
  page,
}) => {
  let nextPageRequests = 0;
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (
      url.pathname === '/api/v1/courses' &&
      url.searchParams.has('cursorId')
    ) {
      nextPageRequests += 1;
      await route.fulfill({ status: 500, json: { message: 'failed' } });
      return;
    }
    await route.fulfill({
      json: {
        result: { items: [], hasNext: true, cursorId: 1, cursorValue: 'next' },
      },
    });
  });
  await page.goto('/local-course');
  await expect(page.getByText('코스 목록을 불러오지 못했어요.')).toBeVisible();
  const attemptsAfterError = nextPageRequests;
  expect(attemptsAfterError).toBeGreaterThan(0);
  await page.waitForTimeout(2500);
  expect(nextPageRequests).toBe(attemptsAfterError);
});

test('deletion dialog restores focus on cancel and leaves the deleted detail on success', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          accessToken: 'e30.eyJleHAiOjk5OTk5OTk5OTl9.eA',
          refreshToken: 'test',
          userId: 1,
          role: 'USER',
          isAuthenticated: true,
          authGeneration: 1,
        },
        version: 4,
      })
    );
  });
  const course = {
    courseId: 1,
    courseType: 'LOCAL',
    title: '테스트 코스',
    thumbnailUrl: '',
    description: '코스 설명',
    tags: [],
    durationType: 'DAY_TRIP',
    transportType: 'WALK',
    startMonth: 4,
    endMonth: 4,
    companionType: 'SOLO',
    isLiked: false,
    canManage: true,
    courseItems: [],
  };
  let deleted = false;
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/v1/courses/1' && request.method() === 'DELETE') {
      deleted = true;
      await route.fulfill({ json: { result: null } });
    } else if (path === '/api/v1/courses/1') {
      await route.fulfill({ json: { result: course } });
    } else if (path === '/api/v1/users/me') {
      await route.fulfill({
        json: { result: { userId: 1, role: 'USER', nickname: '테스트' } },
      });
    } else {
      await route.fulfill({
        json: {
          result: { items: [], hasNext: false, cursorId: 0, cursorValue: '' },
        },
      });
    }
  });
  await page.goto('/local-course/detail/1');
  const menu = page.getByRole('button', { name: '테스트 코스 메뉴' });
  await menu.click();
  await page.getByRole('menuitem', { name: '삭제하기' }).click();
  const cancel = page.getByRole('button', { name: '취소' });
  await expect(cancel).toBeFocused();
  await cancel.click();
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('menuitem', { name: '삭제하기' }).click();
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await expect.poll(() => deleted).toBe(true);
  await expect(page).toHaveURL(/\/local-course$/);
});
