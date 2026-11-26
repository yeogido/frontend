import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'kakao', {
      value: {
        maps: {
          load: (done: () => void) => done(),
          services: {
            Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
            Places: class {
              keywordSearch(
                _query: string,
                done: (items: object[], status: string) => void
              ) {
                done(
                  [
                    {
                      id: 'place-1',
                      place_name: '경포해변',
                      road_address_name: '강원 강릉시',
                      address_name: '',
                      category_group_code: 'AT4',
                      x: '128.9',
                      y: '37.8',
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
  });
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/users/me')
      return route.fulfill({
        json: { result: { userId: 1, role: 'ADMIN', nickname: '관리자' } },
      });
    if (path === '/api/v1/regions')
      return route.fulfill({ json: { result: { regions: [] } } });
    if (path === '/api/v1/regions/popular')
      return route.fulfill({
        json: {
          result: [
            {
              regionId: 1,
              name: '강릉',
              fullName: '강원 강릉',
              imageUrl:
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            },
          ],
        },
      });
    if (path === '/api/v1/regions/search')
      return route.fulfill({
        json: {
          result: [{ regionId: 1, name: '강릉', fullName: '강원 강릉' }],
        },
      });
    return route.fulfill({
      json: {
        result: { items: [], hasNext: false, cursorId: 0, cursorValue: '' },
      },
    });
  });
});

test('desktop admin starts registration and retains the chosen region and form data', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/admin/courses');
  await page.getByRole('button', { name: '코스 추가하기' }).click();
  await expect(
    page.getByRole('heading', { name: '어디를 다녀오셨나요?' })
  ).toBeVisible();
  await page.getByRole('button', { name: /강릉/ }).click();
  await page.getByRole('button', { name: '기본 정보 입력하기' }).click();
  await expect(
    page.getByRole('heading', { name: '어떤 코스인가요?' })
  ).toBeVisible();
  await page.getByLabel('코스의 이름을 알려주세요').fill('강릉 여행');
  await page.getByLabel('코스를 한마디로 소개해주세요').fill('바다 여행');
  await page.locator('#course-duration').click();
  await page.getByRole('option', { name: '당일치기' }).click();
  await page.locator('#visit-start-month').click();
  await page.getByRole('option', { name: '1월', exact: true }).click();
  await page.locator('#visit-end-month').click();
  await page.getByRole('option', { name: '2월', exact: true }).click();
  await page.getByRole('button', { name: /뚜벅이/ }).click();
  await page.getByRole('button', { name: '혼자' }).click();
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
  await page.getByRole('button', { name: '봄 키워드' }).click();
  await page.getByRole('button', { name: '코스 선택하기' }).click();
  await expect(
    page.getByRole('heading', { name: '코스에 방문할 행사를 등록해 주세요' })
  ).toBeVisible();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(
    page.getByRole('heading', { name: '코스에 방문할 장소를 등록해 주세요' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '장소 등록하기' })
  ).toBeDisabled();
  await page.getByLabel('장소명 검색').fill('경포');
  await page.getByRole('button', { name: '경포해변 추가' }).click();
  await expect(
    page.getByRole('heading', { name: '장소에 사진을 추가해 주세요' })
  ).toBeVisible();
  await page.getByRole('button', { name: '사진 추가하기' }).click();
  await page.getByRole('button', { name: '장소 등록하기' }).click();
  await expect(
    page.getByRole('heading', { name: '방문 순서를 설정해 주세요' })
  ).toBeVisible();
  await expect(page.getByText('경포해변')).toBeVisible();
  await expect(
    page.getByRole('button', { name: '코스 등록하기' })
  ).toBeEnabled();
  await page.goBack();
  await page.goBack();
  await page.goBack();
  await page.goBack();
  await expect(page.getByLabel('코스의 이름을 알려주세요')).toHaveValue(
    '강릉 여행'
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('registration keeps the mobile presentation below the desktop breakpoint', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.setViewportSize({ width: 1023, height: 900 });
  await page.goto('/admin/course-registration/region-selection');
  await expect(
    page.locator('[data-responsive-page-mode="main-layout"]')
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '기본 정보 입력하기' })
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
