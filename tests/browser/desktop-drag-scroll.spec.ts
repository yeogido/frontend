import { expect, test, type Locator, type Page } from '@playwright/test';

async function dragLeft(page: Page, list: Locator) {
  await list.scrollIntoViewIfNeeded();
  const box = await list.boundingBox();
  if (!box) throw new Error('scroll list is not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 180, box.y + box.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
}

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop drag interaction');
  await page.addInitScript(() =>
    localStorage.setItem('onboarding-dismissed', 'true')
  );
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const reviews = Array.from({ length: 8 }, (_, index) => ({
      reviewId: index + 1,
      content: `후기 ${index + 1}`,
      rating: 5,
      createdAt: '2026-11-25T12:00:00',
      isMine: false,
      images: [],
      author: {
        nickname: '여행자',
        ageGroup: 'TWENTIES',
        gender: 'NONE',
        profileImageUrl: null,
      },
      course: {
        courseId: index + 1,
        courseType: 'LOCAL',
        title: `코스 ${index + 1}`,
        thumbnailUrl: '',
        durationType: 'DAY_TRIP',
        transportType: 'WALK',
        companionType: 'SOLO',
        tags: [],
        isLiked: false,
      },
    }));
    const result = path.endsWith('/reviews')
      ? { items: reviews, hasNext: false, cursorId: null, cursorValue: null }
      : path.endsWith('/regions')
        ? { regions: [] }
        : /\/(recommended|popular\/local|banner)$/.test(path)
          ? []
          : { items: [], hasNext: false, cursorId: null, cursorValue: null };
    await route.fulfill({
      json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
    });
  });
});

test('home region and review lists drag without opening the item', async ({
  page,
}) => {
  await page.goto('/');
  const regions = page.getByRole('list', { name: '지역 바로가기' });
  await dragLeft(page, regions);
  expect(
    await regions.evaluate((element) => element.scrollLeft)
  ).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/$/);

  const reviews = page.getByRole('list', { name: '최근 후기 목록' });
  await expect(reviews.getByRole('button')).toHaveCount(8);
  await dragLeft(page, reviews);
  expect(
    await reviews.evaluate((element) => element.scrollLeft)
  ).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/$/);
});

test('home regions use the viewport width and keep the edge circles whole', async ({
  page,
}) => {
  await page.goto('/');
  const regions = page.getByRole('list', { name: '지역 바로가기' });
  for (const [width, visible] of [
    [1024, 6],
    [1120, 7],
    [1280, 8],
    [1440, 9],
    [1920, 12],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await regions.evaluate((element) => {
      element.scrollLeft = 0;
    });
    const bounds = await regions.evaluate((element) => {
      const list = element.getBoundingClientRect();
      return { x: list.x, width: list.width };
    });
    expect(bounds.x).toBeCloseTo(0, 0);
    expect(bounds.width).toBeCloseTo(width, 0);
    const first = await regions.getByRole('button').first().boundingBox();
    const lastVisible = await regions
      .getByRole('button')
      .nth(visible - 1)
      .boundingBox();
    const next = await regions.getByRole('button').nth(visible).boundingBox();
    expect(first!.x).toBeGreaterThanOrEqual(24);
    expect(lastVisible!.x + lastVisible!.width).toBeLessThanOrEqual(width - 24);
    expect(next!.x).toBeGreaterThanOrEqual(width - 24);
    await regions.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    const last = await regions.getByRole('button').last().boundingBox();
    expect(last!.x + last!.width).toBeLessThanOrEqual(width - 24);
  }
});

test('home region drag follows the mouse before snapping on release', async ({
  page,
}) => {
  await page.goto('/');
  const regions = page.getByRole('list', { name: '지역 바로가기' });
  await regions.scrollIntoViewIfNeeded();
  const box = await regions.boundingBox();
  if (!box) throw new Error('region list is not visible');
  await page.mouse.move(box.x + 500, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 440, box.y + box.height / 2, { steps: 4 });
  expect(
    await regions.evaluate((element) => element.scrollLeft)
  ).toBeGreaterThan(40);
  await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
});

test('business regions drag without selecting and a click still selects', async ({
  page,
}) => {
  await page.goto('/local-business');
  const regions = page.getByRole('list', { name: '지역 목록' });
  const nationwide = regions.getByRole('button', { name: '전국', exact: true });
  await expect(nationwide).toHaveAttribute('aria-pressed', 'true');
  await dragLeft(page, regions);
  expect(
    await regions.evaluate((element) => element.scrollLeft)
  ).toBeGreaterThan(0);
  await expect(nationwide).toHaveAttribute('aria-pressed', 'true');
  const region = regions.getByRole('button', { name: '경기', exact: true });
  await region.click();
  await expect(region).toHaveAttribute('aria-pressed', 'true');
});
