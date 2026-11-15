import { expect, test } from '@playwright/test';

const friend = {
  userId: 2,
  nickname: '테스트 친구',
  profileImageUrl: null,
  friendCode: 'FRIEND01',
};
const emptyPage = {
  items: [],
  hasNext: false,
  cursorId: null,
  cursorValue: null,
};
const course = (courseId: number) => ({
  courseId,
  title: `테스트 코스 ${courseId}`,
  thumbnailUrl: '',
  region: '서울',
  durationType: 'DAY_TRIP',
  transportType: 'WALK',
  companionType: 'SOLO',
  tags: [],
  isLiked: false,
  canManage: false,
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding-dismissed', 'true');
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
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let result: unknown = emptyPage;
    if (path.endsWith('/users/me'))
      result = {
        userId: 1,
        name: '테스트',
        email: 'test@example.com',
        region: '서울',
        birthYear: 2000,
        role: 'USER',
        profileImageUrl: null,
      };
    else if (path.endsWith('/friends/me/code'))
      result = { friendCode: 'MYCODE01', qrToken: 'mock-token' };
    else if (path.endsWith('/friends/requests/received'))
      result = {
        ...emptyPage,
        items: [{ requestId: 11, requester: friend, createdAt: '2026-01-01' }],
      };
    else if (path.endsWith('/friends/requests/sent'))
      result = {
        ...emptyPage,
        items: [{ requestId: 12, receiver: friend, createdAt: '2026-01-01' }],
      };
    else if (path.endsWith('/friends/2/courses/local'))
      result = { ...emptyPage, items: [course(3), course(4)] };
    else if (path.endsWith('/friends/2/travel-map/years'))
      result = { years: [2026] };
    else if (path.endsWith('/friends/2/travel-map')) result = emptyPage;
    else if (path.endsWith('/travel-records/years')) result = { years: [] };
    else if (path.endsWith('/friends/2'))
      result = {
        ...friend,
        email: 'friend@example.com',
        relationStatus: 'FRIEND',
        requestId: null,
      };
    else if (path.endsWith('/friends'))
      result = {
        ...emptyPage,
        items:
          !url.searchParams.get('keyword') ||
          '테스트 친구'.includes(url.searchParams.get('keyword') ?? '')
            ? [friend]
            : [],
      };
    else if (path.endsWith('/users/me/businesses')) result = [];
    await route.fulfill({ json: { result } });
  });
});

test('desktop navigation, search, confirmation and profile tabs', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/friends');
  await expect(page.getByRole('heading', { name: '친구 목록' })).toBeVisible();
  await expect(page.getByRole('link', { name: /테스트 친구/ })).toBeVisible();
  await page.getByRole('button', { name: '테스트 친구 친구 삭제' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '취소', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '테스트 친구 친구 삭제' })
  ).toBeFocused();
  await page
    .getByRole('textbox', { name: '친구 이름 또는 친구 코드 검색' })
    .fill('테스트');
  await expect(page).toHaveURL(/keyword=/);
  await page.getByRole('link', { name: /테스트 친구/ }).click();
  await expect(
    page.getByRole('heading', { name: '테스트 친구' })
  ).toBeVisible();
  await expect(page.getByText('아직 공개된 여행 폴더가 없어요')).toBeVisible();
  await page.getByRole('tab', { name: '우리동네추천코스' }).click();
  await expect(
    page.getByRole('button', { name: '테스트 코스 3 상세 보기' })
  ).toBeVisible();
  const cards = page
    .getByRole('list', { name: '우리동네 추천 코스' })
    .locator('> li');
  const boxes = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().top)
  );
  expect(boxes[0]).toBe(boxes[1]);
  await page.getByRole('tab', { name: '여행 지도' }).click();
  await expect(page).toHaveURL(/tab=map/);
  await expect(page.getByRole('region', { name: '여행 지도' })).toBeVisible();
  await page.getByRole('tab', { name: '여행 폴더' }).click();
  await expect(page.getByText('아직 공개된 여행 폴더가 없어요')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    .toBe(true);
});

test('profile menu opens QR and requests page on desktop', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/friends');
  await page.getByRole('button', { name: '내 메뉴' }).click();
  await page.getByRole('button', { name: '큐알 보기' }).click();
  await expect(
    page.getByRole('img', { name: '내 친구 QR 코드' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: '친구 요청 확인' }).click();
  await expect(page.getByRole('heading', { name: '친구 요청' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: '테스트 친구의 친구 요청 수락' })
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    )
    .toBe(true);
});

test('desktop profile and account management remain reachable', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/profile');
  await expect(page.getByRole('navigation', { name: '내 활동' })).toBeVisible();
  await page.getByRole('button', { name: '내 메뉴' }).click();
  await page.getByRole('link', { name: '계정 관리' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole('button', { name: '회원 탈퇴하기' })
  ).toBeVisible();
});

test('mobile layout remains active below breakpoint', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  for (const width of [390, 1023]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/friends');
    await expect(
      page.getByRole('heading', { name: '친구 목록' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '내 메뉴' })).toHaveCount(0);
    await expect(
      page.locator('[data-responsive-page-mode="main-layout"]')
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      )
      .toBe(true);
  }
});

test('mutating friend actions use the existing handlers', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const requests: string[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== 'GET') {
      requests.push(`${request.method()} ${url.pathname}`);
      await route.fulfill({
        json: { result: { requestId: 11, status: 'ACCEPTED', friend } },
      });
    } else {
      await route.fallback();
    }
  });
  await page.goto('/friends');
  await page.getByRole('button', { name: '테스트 친구 친구 삭제' }).click();
  await page.getByRole('button', { name: '삭제하기', exact: true }).click();
  await expect
    .poll(() =>
      requests.some((entry) => entry.endsWith('DELETE /api/v1/friends/2'))
    )
    .toBe(true);
  await page.getByRole('link', { name: '친구 요청 확인' }).click();
  await page
    .getByRole('button', { name: '테스트 친구의 친구 요청 수락' })
    .click();
  await expect
    .poll(() =>
      requests.some((entry) =>
        entry.endsWith('PATCH /api/v1/friends/requests/11/accept')
      )
    )
    .toBe(true);
  await page
    .getByRole('button', { name: '테스트 친구에게 보낸 친구 요청 취소' })
    .click();
  await expect
    .poll(() =>
      requests.some((entry) =>
        entry.endsWith('DELETE /api/v1/friends/requests/12')
      )
    )
    .toBe(true);
  await page.goto('/friends/2');
  await page.getByRole('tab', { name: '우리동네추천코스' }).click();
  await page
    .getByRole('button', { name: '테스트 코스 3 좋아요', exact: true })
    .click();
  await expect
    .poll(() => requests.some((entry) => entry.includes('/courses/3/')))
    .toBe(true);
});

test('desktop images load without horizontal overflow at common widths', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/friends');
    await expect(
      page.getByRole('heading', { name: '친구 목록' })
    ).toBeVisible();
    expect(
      await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        broken: Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.src),
      }))
    ).toEqual({ overflow: false, broken: [] });
  }
  expect(errors).toEqual([]);
});
