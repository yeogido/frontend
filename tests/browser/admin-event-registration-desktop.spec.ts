import { expect, test } from '@playwright/test';

test('관리자 행사 등록 데스크톱 흐름과 모바일 전환', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('onboarding-dismissed', 'true');
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          accessToken: 'e30.eyJleHAiOjk5OTk5OTk5OTl9.eA',
          refreshToken: 'test',
          userId: 1,
          role: 'ADMIN',
          isAuthenticated: true,
          authGeneration: 1,
        },
        version: 4,
      })
    );
    Object.assign(window, {
      kakao: {
        maps: {
          load: (callback: () => void) => callback(),
          services: {
            Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
            Places: class {
              keywordSearch(
                _query: string,
                callback: (data: unknown[], status: string) => void
              ) {
                callback(
                  [
                    {
                      id: '123',
                      place_name: '테스트 장소',
                      road_address_name: '서울 테스트로 1',
                      address_name: '서울 테스트동',
                      x: '127',
                      y: '37.5',
                    },
                  ],
                  'OK'
                );
              }
            },
          },
        },
      },
    });
  });
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET')
      throw new Error('실제 등록 요청은 실행하지 않습니다.');
    await route.fulfill({
      json: {
        result: path.endsWith('/users/me')
          ? {
              userId: 1,
              name: '관리자',
              email: 'test@example.com',
              role: 'ADMIN',
              profileImageUrl: null,
            }
          : path.endsWith('/regions')
            ? { regions: [] }
            : [],
      },
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/event-registration/place-selection', {
    waitUntil: 'domcontentloaded',
  });
  await expect(
    page.getByRole('heading', { name: '행사가 진행되는 장소를 등록해 주세요' })
  ).toBeVisible();
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  }
  await page.getByRole('searchbox', { name: '장소명 검색' }).fill('테스트');
  await page.getByRole('button', { name: '테스트 장소 추가' }).click();
  await expect(
    page.getByRole('button', { name: '장소 등록하기' })
  ).toBeEnabled();
  await page.getByRole('button', { name: '장소 등록하기' }).click();
  await expect(
    page.getByRole('heading', { name: '어떤 행사인가요?' })
  ).toBeVisible();
  await page.getByLabel('행사의 이름을 알려주세요').fill('테스트 행사');
  const year = String(new Date().getFullYear());
  for (const legend of ['시작 날짜', '종료 날짜']) {
    await page.getByLabel(`${legend} 연도`).selectOption(year);
    await page.getByLabel(`${legend} 월`).selectOption('08');
    await page.getByLabel(`${legend} 일`).selectOption('06');
  }
  await page.getByLabel('종료 날짜 일').selectOption('05');
  await expect(page.getByRole('alert')).toContainText(
    '종료 날짜는 시작 날짜보다 빠를 수 없어요.'
  );
  await expect(
    page.getByRole('button', { name: '사진 추가하기' })
  ).toBeDisabled();
  await page.getByLabel('종료 날짜 일').selectOption('06');
  await page.getByRole('button', { name: '사진 추가하기' }).click();
  await expect(
    page.getByRole('heading', { name: '사진과 키워드를 추가해 주세요' })
  ).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({
    name: 'cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aN8AAAAASUVORK5CYII=',
      'base64'
    ),
  });
  await page.getByRole('button', { name: '여름 키워드' }).click();
  await page.getByRole('button', { name: '축제', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '행사 등록하기' })
  ).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath('photo-tag.png'),
    fullPage: true,
  });
  expect(
    await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.src)
    )
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);

  await page.setViewportSize({ width: 1023, height: 900 });
  await page.goto('/admin/event-registration/place-selection', {
    waitUntil: 'domcontentloaded',
  });
  await expect(
    page.getByRole('heading', { name: /행사가 진행되는/ })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '선택된 장소' })).toHaveCount(
    0
  );
});
