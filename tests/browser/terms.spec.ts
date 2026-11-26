import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('onboarding-dismissed', 'true')
  );
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const result = path.endsWith('/regions')
      ? { regions: [] }
      : /\/(recommended|popular\/local|banner)$/.test(path)
        ? []
        : { items: [], hasNext: false, cursorId: null, cursorValue: null };
    await route.fulfill({
      json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
    });
  });
});

test('footer opens the full terms and chapters expand independently', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('link', { name: '여기도 이용약관 >' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(
    page.getByRole('heading', { name: '여기도 서비스 이용약관' })
  ).toBeVisible();
  await expect(page.getByText('시행일: 2026년 11월 14일')).toBeVisible();
  const chapters = page.locator('details');
  await expect(chapters).toHaveCount(9);
  await page.getByText('제1장 총칙', { exact: true }).click();
  await expect(chapters.nth(0)).toHaveAttribute('open', '');
  await expect(page.getByText('제1조 (목적)', { exact: false })).toBeVisible();
  await page.getByText('제9장 기타', { exact: true }).click();
  await expect(chapters.nth(8)).toHaveAttribute('open', '');
  await expect(page.getByText('제28조 (기타)', { exact: false })).toBeVisible();
  await expect(
    page.getByText('문의처: yeogido25@gmail.com', { exact: false })
  ).toBeVisible();
  await page.getByText('제1장 총칙', { exact: true }).click();
  await expect(chapters.nth(0)).not.toHaveAttribute('open', '');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('terms.png'),
    fullPage: true,
  });
});

test('terms stay readable across the mobile and desktop breakpoint', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Viewport boundary checks');
  for (const width of [320, 390, 1023, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/terms');
    await expect(
      page.getByRole('heading', { name: '여기도 서비스 이용약관' })
    ).toBeVisible();
    await expect(page.locator('details')).toHaveCount(9);
    await page.getByText('제1장 총칙', { exact: true }).click();
    await expect(
      page.getByText('제3조 (약관의 효력 및 변경)', { exact: false })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  }
});
