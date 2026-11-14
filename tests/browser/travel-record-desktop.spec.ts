import { expect, test } from '@playwright/test';

const image =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="coral"/></svg>'
  );
const empty = { items: [], cursorId: null, cursorValue: null, hasNext: false };
const record = (id: number) => ({
  travelRecordId: id,
  title: `여행 ${id}`,
  regionId: 2,
  startDate: '2026-08-17',
  endDate: '2026-08-18',
  folderTheme: 'BASIC',
  createdAt: '',
  coverImageUrl: image,
  visibility: 'PRIVATE',
  version: 0,
  owner: { userId: 999, nickname: '나', profileImageUrl: null },
  participants: [],
  permissions: {
    canEdit: true,
    canDelete: true,
    canLeave: false,
    canInvite: false,
    canLinkShare: false,
  },
  images: [
    {
      imageId: id,
      imageKey: `travel-records/${id}.png`,
      imageUrl: image,
      imageOrder: 1,
    },
  ],
  stickers: [],
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding-dismissed', 'true');
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          userId: 999,
          accessToken: 'e30.eyJleHAiOjk5OTk5OTk5OTl9.eA',
          refreshToken: 'fixture',
          role: 'USER',
          isAuthenticated: true,
          authGeneration: 0,
        },
        version: 4,
      })
    );
  });
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    let result: unknown = empty;
    if (url.pathname.endsWith('/users/me'))
      result = {
        userId: 999,
        name: '테스트',
        role: 'USER',
        profileImageUrl: null,
      };
    else if (url.pathname.endsWith('/travel-records/years'))
      result = { years: [2026, 2025] };
    else if (url.pathname.endsWith('/travel-records/map')) result = empty;
    else if (url.pathname.endsWith('/travel-records'))
      result = { ...empty, items: [record(1), record(2), record(3)] };
    else if (/\/travel-records\/\d+$/.test(url.pathname))
      result = record(Number(url.pathname.split('/').at(-1)));
    else if (url.pathname.endsWith('/regions/2'))
      result = { regionId: 2, name: '부산', fullName: '부산광역시' };
    await route.fulfill({ json: { result } });
  });
});

test('desktop folder grid, filters and map switch', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/travel-record');
  await expect(
    page.getByRole('button', { name: '여행 폴더', exact: true })
  ).toBeVisible();
  const grid = page.getByRole('region', { name: '여행 폴더 목록' });
  await expect(
    grid.getByRole('button', { name: /여행 기록 상세 보기/ })
  ).toHaveCount(3);
  const tops = await grid
    .locator('article')
    .evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().top)
    );
  expect(new Set(tops).size).toBe(1);
  await page.getByRole('button', { name: '친구 공개' }).click();
  await expect(
    page.getByText('선택한 공개범위의 여행 폴더가 없어요')
  ).toBeVisible();
  await page.getByRole('button', { name: '여행 지도', exact: true }).click();
  await expect(page.getByRole('region', { name: '여행 지도' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: '기록 추가하기' })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('breakpoint keeps the mobile page below 1024px', async ({ page }) => {
  for (const width of [390, 1023, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/travel-record');
    await expect(
      page.getByRole('button', { name: '여행 폴더', exact: true })
    ).toBeVisible();
    if (width < 1024)
      await expect(
        page.getByRole('button', { name: '기록 추가하기' })
      ).toHaveCount(0);
    else
      await expect(
        page.getByRole('button', { name: '기록 추가하기' })
      ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  }
});
