import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop review flow');
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/v1/courses/123/summary') {
      await route.fulfill({
        json: {
          result: {
            courseId: 123,
            title: '강릉 여행 코스',
            thumbnailUrl: '',
            durationType: 'ONE_NIGHT',
            transportType: 'WALK',
            companionType: 'SOLO',
          },
        },
      });
    } else if (
      path === '/api/v1/courses/123/reviews' &&
      request.method() === 'POST'
    ) {
      await route.fulfill({ json: { result: { reviewId: 1 } } });
    } else {
      await route.fulfill({ json: { result: { items: [], hasNext: false } } });
    }
  });
});

test('switches between desktop and mobile at the breakpoint', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/review?type=local-course&id=123');
  await expect(
    page.getByRole('navigation', { name: '주요 메뉴' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '강릉 여행 코스' })
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('review-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(
    page.getByRole('navigation', { name: '주요 메뉴' })
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(1024);
  for (const width of [1023, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole('button', { name: '이전 페이지로 이동' })
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: '주요 메뉴' })
    ).toHaveCount(0);
  }
});

test('selects and removes photos, chooses a rating, and submits a review', async ({
  page,
}) => {
  await page.goto('/review?type=local-course&id=123');
  const input = page.getByLabel('후기 사진 선택');
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aXcAAAAASUVORK5CYII=',
    'base64'
  );
  await input.setInputFiles(
    Array.from({ length: 6 }, (_, index) => ({
      name: `photo-${index}.png`,
      mimeType: 'image/png',
      buffer: image,
    }))
  );
  await expect(page.getByText('(5/5)')).toBeVisible();
  await page.getByRole('button', { name: '사진 1 삭제' }).click();
  await expect(page.getByText('(4/5)')).toBeVisible();
  for (let index = 4; index > 0; index--) {
    await page.getByRole('button', { name: `사진 ${index} 삭제` }).click();
  }
  await page.getByRole('button', { name: '3점', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '3점', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('총평을 남겨주세요').fill('즐거운 여행이었어요.');
  const request = page.waitForRequest(
    (req) =>
      req.method() === 'POST' && req.url().includes('/courses/123/reviews')
  );
  await page.getByRole('button', { name: '후기 등록하기' }).click();
  expect((await request).postDataJSON()).toMatchObject({
    rating: 3,
    content: '즐거운 여행이었어요.',
  });
  await expect(page).toHaveURL(/\/local-course\/detail\/123$/);
});
