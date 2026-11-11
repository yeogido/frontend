import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const photo = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${color}"/></svg>`)}`;
const currentPhoto = photo('coral');
const oldPhoto = photo('seagreen');
const token = (userId: number) =>
  `e30.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: String(userId) })).toString('base64url')}.test`;
const auth = (userId: number) => ({
  accessToken: token(userId),
  refreshToken: 'fixture-only',
  userId,
  role: 'USER',
});
const record = (id: number, year: number, url: string) => ({
  travelRecordId: id,
  title: '부산 여행',
  regionId: 2,
  regionName: '부산광역시',
  latitude: 35.1796,
  longitude: 129.0756,
  startDate: `${year - 1}-12-31`,
  endDate: `${year}-01-02`,
  visibility: 'PRIVATE',
  images: [
    {
      imageId: id,
      imageKey: `travel-records/${id}.png`,
      imageUrl: url,
      imageOrder: 1,
    },
  ],
});

async function mockApp(
  page: Page,
  { guest = false, failNextPage = false } = {}
) {
  const requests: URL[] = [];
  const runtimeErrors: string[] = [];
  let accountResponseGate: Promise<void> | undefined;
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.addInitScript(
    ({ session, guest }) => {
      localStorage.setItem('onboarding-dismissed', 'true');
      if (!guest)
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: { ...session, isAuthenticated: true, authGeneration: 0 },
            version: 4,
          })
        );
    },
    { session: auth(999), guest }
  );
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    requests.push(url);
    const accountChanged = request
      .headers()
      .authorization?.includes(token(1000));
    const json = (result: unknown) =>
      route.fulfill({
        json: {
          isSuccess: true,
          code: 'COMMON200',
          message: 'ok',
          result,
        },
      });
    const empty = {
      items: [],
      cursorValue: null,
      cursorId: null,
      hasNext: false,
    };
    if (url.pathname.endsWith('/travel-records/years')) {
      return json({ years: accountChanged ? [2026] : [2026, 2025] });
    }
    if (url.pathname.endsWith('/travel-records/map')) {
      if (accountChanged) {
        await accountResponseGate;
        return json({ ...empty, items: [record(4, 2026, oldPhoto)] });
      }
      if (url.searchParams.get('year') === '2025')
        return json({ ...empty, items: [record(5, 2025, oldPhoto)] });
      if (url.searchParams.has('cursor')) {
        if (failNextPage)
          return route.fulfill({
            status: 500,
            json: {
              isSuccess: false,
              code: 'COMMON5001',
              message: '조회 실패',
              result: null,
            },
          });
        return json(empty);
      }
      return json({
        items: [record(30, 2026, currentPhoto)],
        cursorValue: null,
        cursorId: 30,
        hasNext: true,
      });
    }
    if (url.pathname.endsWith('/users/me'))
      return json({
        userId: accountChanged ? 1000 : 999,
        name: '테스트',
        role: 'USER',
        profileImageUrl: null,
      });
    if (
      /\/courses\/(recommended|popular\/local)$|\/contents\/banner$/.test(
        url.pathname
      )
    )
      return json([]);
    return json(empty);
  });
  return {
    requests,
    runtimeErrors,
    pauseAccountResponse: () => {
      let release!: () => void;
      accountResponseGate = new Promise<void>((resolve) => {
        release = resolve;
      });
      return release;
    },
    recover: () => {
      failNextPage = false;
    },
  };
}

test('지도 API를 페이지 끝까지 조회하고 종료일 연도로 필터링한다', async ({
  page,
}) => {
  const { requests, runtimeErrors } = await mockApp(page);
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '여행 지도', exact: true }).click();
  const image = page.locator('image[data-region="부산광역시"]');
  await expect(image).toHaveAttribute('href', currentPhoto);
  expect(
    requests.some(
      (url) =>
        url.pathname.endsWith('/travel-records/map') &&
        url.searchParams.get('year') === '2026' &&
        url.searchParams.get('cursor') === '30'
    )
  ).toBeTruthy();
  expect(
    requests.some((url) => /\/travel-records\/\d+$/.test(url.pathname))
  ).toBeFalsy();
  const year = page.getByRole('button', { name: /여행 기록 연도 선택/ });
  await year.click();
  await page.getByRole('button', { name: '2025', exact: true }).click();
  await expect(image).toHaveAttribute('href', oldPhoto);
  await year.click();
  await page.getByRole('button', { name: '2026', exact: true }).click();
  await expect(image).toHaveAttribute('href', currentPhoto);
  expect(runtimeErrors).toEqual([]);
});

test('계정이 바뀌면 이전 계정의 지도 캐시를 표시하지 않는다', async ({
  page,
}) => {
  const { runtimeErrors, pauseAccountResponse } = await mockApp(page);
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '여행 지도', exact: true }).click();
  const image = page.locator('image[data-region="부산광역시"]');
  await expect(image).toHaveAttribute('href', currentPhoto);
  const release = pauseAccountResponse();
  // 로그인 성공 시의 상태 전이를 재현한다. 로그인 API 자체는 이 테스트 범위 밖이다.
  await page.evaluate(async (session) => {
    const { useAuthStore } = await import('/src/store/auth.store.ts');
    useAuthStore.getState().setAuth(session);
  }, auth(1000));
  try {
    await expect(image).toHaveCount(0);
  } finally {
    release();
  }
  await expect(image).toHaveAttribute('href', oldPhoto);
  expect(runtimeErrors).toEqual([]);
});

test('중간 페이지가 실패하면 부분 지도를 숨기고 재시도로 복구한다', async ({
  page,
}) => {
  const app = await mockApp(page, { failNextPage: true });
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '여행 지도', exact: true }).click();
  const retry = page.getByRole('button', { name: '다시 시도', exact: true });
  await expect(retry).toBeVisible();
  await expect(page.locator('image[data-region]')).toHaveCount(0);
  app.recover();
  await retry.click();
  await expect(page.locator('image[data-region="부산광역시"]')).toHaveAttribute(
    'href',
    currentPhoto
  );
  expect(app.runtimeErrors).toEqual([]);
});

test('비로그인 홈에서는 개인 여행지도 API를 요청하지 않는다', async ({
  page,
}) => {
  const { requests, runtimeErrors } = await mockApp(page, { guest: true });
  await page.goto('/');
  await expect(page.getByText('기록 지도', { exact: true })).toBeVisible();
  expect(
    requests.some((url) => url.pathname.includes('/travel-records'))
  ).toBeFalsy();
  await expect(page.locator('image[data-region]')).toHaveCount(0);
  expect(runtimeErrors).toEqual([]);
});
