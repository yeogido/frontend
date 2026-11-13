import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const token = (id: number) =>
  `e30.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: String(id) })).toString('base64url')}.test`;
const pending = (id: number, title = '이전 연도 부산') => ({
  invitationId: id,
  status: 'PENDING',
  inviter: { userId: 3, nickname: `친구${id}`, profileImageUrl: null },
  owner: { userId: 2, nickname: '앨범 생성자', profileImageUrl: null },
  travelRecord: {
    travelRecordId: id + 1000,
    title,
    regionId: 2,
    startDate: '2024-05-01',
    endDate: '2024-05-03',
    folderTheme: 'BASIC',
  },
  createdAt: '2026-11-12T12:00:00',
});
const empty = { items: [], cursorValue: null, cursorId: null, hasNext: false };

async function setup(
  page: Page,
  options: {
    listError?: boolean;
    responseError?: string;
    nextError?: string;
    repeatCursorError?: boolean;
    pages?: boolean;
    delayed?: boolean;
    delayedList?: boolean;
    guest?: boolean;
    empty?: boolean;
    existing?: boolean;
    folderPages?: boolean;
  } = {}
) {
  const requests: { path: string; method: string; body: unknown }[] = [];
  const errors: string[] = [];
  let accepted = options.existing ?? false;
  let resolved = false;
  let listFailed = false;
  let nextFailed = false;
  let responseFailed = false;
  let release = () => {};
  const gate =
    options.delayed || options.delayedList
      ? new Promise<void>((resolve) => {
          release = resolve;
        })
      : undefined;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    ({ accessToken, guest }) => {
      localStorage.setItem('onboarding-dismissed', 'true');
      if (!guest)
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: {
              accessToken,
              refreshToken: 'fixture-only',
              userId: 999,
              role: 'USER',
              isAuthenticated: true,
              authGeneration: 0,
            },
            version: 4,
          })
        );
    },
    { accessToken: token(999), guest: options.guest }
  );
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    requests.push({
      path: url.pathname + url.search,
      method: req.method(),
      body: req.postDataJSON(),
    });
    const json = (result: unknown) =>
      route.fulfill({
        json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
      });
    const fail = (code: string) =>
      route.fulfill({
        status: code.includes('403')
          ? 403
          : code.includes('404')
            ? 404
            : code.includes('400')
              ? 400
              : code.includes('409')
                ? 409
                : 500,
        json: {
          isSuccess: false,
          code,
          message: '초대를 처리할 수 없어요.',
          result: null,
        },
      });
    const otherAccount = req.headers().authorization?.includes(token(1000));
    if (
      url.pathname.endsWith('/travel-records/invitations') &&
      req.method() === 'GET'
    ) {
      if (otherAccount || options.empty) return json(empty);
      if (options.delayedList) await gate;
      if (options.listError && !listFailed) {
        listFailed = true;
        return fail('TEST500');
      }
      if (url.searchParams.has('cursor')) {
        if (options.nextError && (!nextFailed || options.repeatCursorError)) {
          nextFailed = true;
          return fail(options.nextError);
        }
        return json({
          ...empty,
          items: [pending(100), pending(99, '다음 페이지 초대')],
        });
      }
      return json({
        ...empty,
        items: resolved ? [] : [pending(101)],
        hasNext: Boolean(options.pages && !resolved),
        cursorId: options.pages ? 101 : null,
      });
    }
    if (/\/invitations\/\d+$/.test(url.pathname) && req.method() === 'PATCH') {
      await gate;
      if (options.responseError && !responseFailed) {
        responseFailed = true;
        if (options.responseError !== 'TEST500') resolved = true;
        return fail(options.responseError);
      }
      resolved = true;
      accepted = req.postDataJSON().status === 'ACCEPTED';
      return json({
        invitationId: 101,
        travelRecordId: 1101,
        status: accepted ? 'ACCEPTED' : 'DECLINED',
      });
    }
    if (url.pathname.endsWith('/travel-records/years'))
      return json({ years: accepted && !otherAccount ? [2026, 2024] : [2026] });
    const record = {
      travelRecordId: 1101,
      title: '수락한 부산 폴더',
      regionId: 2,
      startDate:
        options.existing || options.folderPages ? '2026-05-01' : '2024-05-01',
      endDate:
        options.existing || options.folderPages ? '2026-05-03' : '2024-05-03',
      folderTheme: 'BASIC',
      visibility: 'FRIENDS',
      version: 4,
      images: [
        {
          imageId: 1,
          imageKey: 'travel-records/accepted.png',
          imageOrder: 1,
          imageUrl:
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="coral"/%3E%3C/svg%3E',
        },
      ],
      owner: pending(101).owner,
      participants: [{ userId: 999, nickname: '나', profileImageUrl: null }],
      permissions: {
        canEdit: true,
        canDelete: false,
        canLeave: true,
        canInvite: true,
        canLinkShare: false,
      },
    };
    if (url.pathname.endsWith('/travel-records/map'))
      return json({
        ...empty,
        items:
          accepted && !otherAccount
            ? [
                {
                  ...record,
                  regionName: '부산광역시',
                  latitude: 35,
                  longitude: 129,
                },
              ]
            : [],
      });
    if (url.pathname.endsWith('/travel-records') && options.folderPages) {
      return json({
        ...empty,
        items: [
          url.searchParams.has('cursor')
            ? { ...record, travelRecordId: 1102, title: '다음 폴더' }
            : record,
        ],
        cursorId: url.searchParams.has('cursor') ? null : 1101,
        hasNext: !url.searchParams.has('cursor'),
      });
    }
    if (url.pathname.endsWith('/travel-records'))
      return json({
        ...empty,
        items:
          accepted &&
          !otherAccount &&
          url.searchParams.get('year') === record.startDate.slice(0, 4)
            ? [record]
            : [],
      });
    if (url.pathname.endsWith('/travel-records/1101')) return json(record);
    if (url.pathname.endsWith('/travel-records/1102'))
      return json({ ...record, travelRecordId: 1102, title: '다음 폴더' });
    if (url.pathname.endsWith('/regions/2'))
      return json({
        regionId: 2,
        name: '부산',
        fullName: '부산광역시',
        latitude: 35,
        longitude: 129,
      });
    if (url.pathname.endsWith('/users/me'))
      return json({
        userId: otherAccount ? 1000 : 999,
        nickname: '테스터',
        profileImageUrl: null,
        role: 'USER',
      });
    return json(empty);
  });
  return { requests, errors, release };
}

test('shows old-year invitations without fetching album detail and respects visibility filters', async ({
  page,
}, testInfo) => {
  const app = await setup(page);
  await page.goto('/travel-record');
  await expect(
    page.getByRole('article', { name: '친구101님의 이전 연도 부산 앨범 초대' })
  ).toBeVisible();
  expect(
    app.requests.some((request) => /travel-records\/1101/.test(request.path))
  ).toBe(false);
  await page.getByRole('button', { name: '나만보기', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: '친구 공개', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await testInfo.attach('received-invitations', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  expect(app.errors).toEqual([]);
});

test('accepts once, waits for the server and refreshes real folders and years', async ({
  page,
}) => {
  const app = await setup(page, { delayed: true });
  await page.goto('/travel-record');
  const accept = page.getByRole('button', { name: '친구101님의 초대 수락' });
  await accept.click();
  await expect(accept).toBeDisabled();
  await expect(
    page.getByRole('button', { name: '친구101님의 초대 거절' })
  ).toBeDisabled();
  await expect(page.getByRole('article')).toHaveCount(1);
  expect(app.requests.filter((req) => req.method === 'PATCH')).toHaveLength(1);
  app.release();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '여행 기록 연도 선택, 현재 2026년' })
  ).toBeVisible();
  await page
    .getByRole('button', { name: '여행 기록 연도 선택, 현재 2026년' })
    .click();
  await page.getByRole('button', { name: '2024', exact: true }).click();
  await expect(
    page.getByText('수락한 부산 폴더', { exact: true })
  ).toBeVisible();
  expect(app.requests.filter((req) => req.method === 'PATCH')[0].body).toEqual({
    status: 'ACCEPTED',
  });
  await expect
    .poll(
      () => app.requests.filter((req) => req.path.endsWith('/years')).length
    )
    .toBeGreaterThan(1);
  expect(app.errors).toEqual([]);
});

test('does not reuse the previous account folder cache after switching accounts', async ({
  page,
}) => {
  await setup(page, { existing: true });
  await page.goto('/travel-record');
  await expect(
    page.getByText('수락한 부산 폴더', { exact: true })
  ).toBeVisible();
  const nextAccount = page.waitForResponse(
    (response) =>
      response.url().includes('/travel-records/invitations') &&
      response.request().headers().authorization?.includes(token(1000)) === true
  );
  await page.evaluate(async (accessToken) => {
    const { useAuthStore } = await import('/src/store/auth.store.ts');
    useAuthStore
      .getState()
      .setAuth({
        accessToken,
        refreshToken: 'fixture-only',
        userId: 1000,
        role: 'USER',
      });
  }, token(1000));
  await nextAccount;
  await expect(page.getByText('수락한 부산 폴더', { exact: true })).toHaveCount(
    0
  );
});

test('declines without creating a real folder', async ({ page }) => {
  const app = await setup(page);
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '친구101님의 초대 거절' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(app.requests.find((req) => req.method === 'PATCH')?.body).toEqual({
    status: 'DECLINED',
  });
  await expect(page.getByText('수락한 부산 폴더', { exact: true })).toHaveCount(
    0
  );
});

test('loads subsequent invitation pages', async ({ page }) => {
  const app = await setup(page, { pages: true });
  await page.goto('/travel-record');
  await expect(page.getByRole('article').first()).toBeVisible();
  await page.getByRole('article').last().scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('article', { name: '친구99님의 다음 페이지 초대 앨범 초대' })
  ).toBeVisible();
  expect(
    app.requests.some(
      (req) =>
        req.path.includes('/invitations?') && req.path.includes('cursor=101')
    )
  ).toBe(true);
});

test('paginates ordinary folders and invitations together without losing either list', async ({
  page,
}) => {
  const app = await setup(page, { pages: true, folderPages: true });
  await page.goto('/travel-record');
  await expect(
    page.getByText('수락한 부산 폴더', { exact: true })
  ).toBeVisible();
  await page.getByRole('article').last().scrollIntoViewIfNeeded();
  await expect(page.getByText('다음 폴더', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('article', { name: '친구99님의 다음 페이지 초대 앨범 초대' })
  ).toHaveCount(1);
  expect(
    app.requests.some(
      (req) =>
        req.path.includes('/travel-records?') &&
        req.path.includes('cursor=1101')
    )
  ).toBe(true);
  expect(
    app.requests.some(
      (req) =>
        req.path.includes('/invitations?') && req.path.includes('cursor=101')
    )
  ).toBe(true);
});

test('retries a failed initial invitation query without showing an empty state', async ({
  page,
}) => {
  await setup(page, { listError: true });
  await page.goto('/travel-record');
  await expect(
    page.getByRole('button', { name: '받은 초대 다시 시도' })
  ).toBeVisible();
  await expect(
    page.getByText('아직 추가한 여행 기록이 없어요', { exact: false })
  ).toHaveCount(0);
  await page.getByRole('button', { name: '받은 초대 다시 시도' }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
});

test('keeps loaded invitations on additional page failure and retries that page', async ({
  page,
}) => {
  await setup(page, { pages: true, nextError: 'TEST500' });
  await page.goto('/travel-record');
  await expect(
    page.getByRole('button', { name: '받은 초대 다시 시도' })
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: '받은 초대 다시 시도' }).click();
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('restarts without a cursor after a deleted invitation invalidates pagination', async ({
  page,
}) => {
  const app = await setup(page, {
    pages: true,
    nextError: 'TRAVEL_RECORD4006',
  });
  await page.goto('/travel-record');
  await expect(page.getByRole('article')).toHaveCount(3);
  const paths = app.requests
    .filter((req) => req.path.includes('/invitations?'))
    .map((req) => req.path);
  expect(paths.filter((path) => !path.includes('cursor='))).toHaveLength(2);
  expect(paths.filter((path) => path.includes('cursor=101'))).toHaveLength(2);
});

test('manual retry restarts the first page when the same cursor repeatedly becomes invalid', async ({
  page,
}) => {
  const app = await setup(page, {
    pages: true,
    nextError: 'TRAVEL_RECORD4006',
    repeatCursorError: true,
  });
  await page.goto('/travel-record');
  await expect(
    page.getByRole('button', { name: '받은 초대 다시 시도' })
  ).toBeVisible();
  const firstReads = () =>
    app.requests.filter(
      (req) =>
        req.path.includes('/invitations?') && !req.path.includes('cursor=')
    ).length;
  expect(firstReads()).toBe(2);
  await page.getByRole('button', { name: '받은 초대 다시 시도' }).click();
  await expect.poll(firstReads).toBe(3);
});

test('recovers a cursor invalidated during background refetch after responding', async ({
  page,
}) => {
  await setup(page);
  let responded = false;
  let invalidated = false;
  page.on('request', (req) => {
    if (req.method() === 'PATCH') responded = true;
  });
  await page.route('**/api/v1/travel-records/invitations?*', async (route) => {
    const url = new URL(route.request().url());
    const json = (result: unknown) =>
      route.fulfill({
        json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
      });
    if (invalidated) return json(empty);
    if (!url.searchParams.has('cursor'))
      return json({
        ...empty,
        items: [pending(responded ? 100 : 101)],
        cursorId: responded ? 100 : 101,
        hasNext: true,
      });
    if (!responded)
      return json({ ...empty, items: [pending(100)], cursorId: 100 });
    invalidated = true;
    return route.fulfill({
      status: 400,
      json: {
        isSuccess: false,
        code: 'TRAVEL_RECORD4006',
        message: '커서가 삭제됐어요.',
        result: null,
      },
    });
  });
  await page.goto('/travel-record');
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByRole('button', { name: '친구101님의 초대 거절' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '받은 초대 다시 시도' })
  ).toHaveCount(0);
});

test('refreshes a cached map and reads the latest detail version after accepting', async ({
  page,
}) => {
  const app = await setup(page);
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '여행 지도', exact: true }).click();
  await expect(
    page.getByRole('region', { name: '여행 지도', exact: true })
  ).toBeVisible();
  await expect(page.locator('[data-region="부산광역시"]')).toHaveCount(0);
  await page.getByRole('button', { name: '여행 폴더', exact: true }).click();
  await page.getByRole('button', { name: '친구101님의 초대 수락' }).click();
  await expect(
    page.getByRole('button', { name: '친구101님의 초대 수락' })
  ).toHaveCount(0);
  await page.getByRole('button', { name: '여행 지도', exact: true }).click();
  await expect(page.locator('[data-region="부산광역시"]')).toBeVisible();
  expect(
    app.requests.filter(
      (req) =>
        req.path.includes('/travel-records/map?') &&
        req.path.includes('year=2026')
    ).length
  ).toBeGreaterThan(1);
  await page.getByRole('button', { name: '여행 폴더', exact: true }).click();
  await page
    .getByRole('button', { name: '여행 기록 연도 선택, 현재 2026년' })
    .click();
  await page.getByRole('button', { name: '2024', exact: true }).click();
  await page
    .getByRole('button', { name: '수락한 부산 폴더 여행 기록 상세 보기' })
    .click();
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await page.getByRole('menuitem', { name: '수정', exact: true }).click();
  await expect(page).toHaveURL(/\/travel-record\/1101\/edit/);
  const version = await page.evaluate(async () => {
    const { useTravelRecordSessionStore } =
      await import('/src/store/travelRecordSession.store.ts');
    return useTravelRecordSessionStore.getState().editSession?.version;
  });
  expect(version).toBe(4);
});

test('keeps an invitation after a response network failure and allows a manual retry', async ({
  page,
}) => {
  const app = await setup(page, { responseError: 'TEST500' });
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '친구101님의 초대 수락' }).click();
  await expect(
    page.getByText('초대를 처리할 수 없어요.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '친구101님의 초대 수락' })
  ).toBeEnabled();
  expect(app.requests.filter((req) => req.method === 'PATCH')).toHaveLength(1);
  await page.getByRole('button', { name: '친구101님의 초대 수락' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(app.requests.filter((req) => req.method === 'PATCH')).toHaveLength(2);
});

for (const code of [
  'COMMON4031',
  'TRAVEL_RECORD4042',
  'TRAVEL_RECORD4094',
  'TRAVEL_RECORD4095',
]) {
  test(`refreshes stale invitations after ${code} without granting membership`, async ({
    page,
  }) => {
    const app = await setup(page, { responseError: code });
    await page.goto('/travel-record');
    await page.getByRole('button', { name: '친구101님의 초대 수락' }).click();
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(
      page.getByText('수락한 부산 폴더', { exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByText('초대를 수락했어요.', { exact: true })
    ).toHaveCount(0);
    expect(app.requests.filter((req) => req.method === 'PATCH')).toHaveLength(
      1
    );
  });
}

test('ignores a previous account response after switching accounts', async ({
  page,
}) => {
  const app = await setup(page, { delayed: true });
  await page.goto('/travel-record');
  await page.getByRole('button', { name: '친구101님의 초대 수락' }).click();
  await expect
    .poll(() => app.requests.filter((req) => req.method === 'PATCH').length)
    .toBe(1);
  await page.evaluate(async (accessToken) => {
    const { useAuthStore } = await import('/src/store/auth.store.ts');
    useAuthStore
      .getState()
      .setAuth({
        accessToken,
        refreshToken: 'fixture-only',
        userId: 1000,
        role: 'USER',
      });
  }, token(1000));
  await expect(page.getByRole('article')).toHaveCount(0);
  const response = page.waitForResponse(
    (result) =>
      result.request().method() === 'PATCH' &&
      result.url().includes('/invitations/101')
  );
  app.release();
  await (await response).finished();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  await expect(
    page.getByText('초대를 수락했어요.', { exact: true })
  ).toHaveCount(0);
  await expect(page.getByText('수락한 부산 폴더', { exact: true })).toHaveCount(
    0
  );
  expect(app.errors).toEqual([]);
});

test('does not show a delayed invitation list from the previous account', async ({
  page,
}) => {
  const app = await setup(page, { delayedList: true });
  const firstRequest = page.waitForRequest((req) =>
    req.url().includes('/travel-records/invitations')
  );
  await page.goto('/travel-record');
  await firstRequest;
  const nextResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/travel-records/invitations') &&
      response.request().headers().authorization?.includes(token(1000)) === true
  );
  await page.evaluate(async (accessToken) => {
    const { useAuthStore } = await import('/src/store/auth.store.ts');
    useAuthStore
      .getState()
      .setAuth({
        accessToken,
        refreshToken: 'fixture-only',
        userId: 1000,
        role: 'USER',
      });
  }, token(1000));
  await nextResponse;
  const oldResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/travel-records/invitations') &&
      response.request().headers().authorization?.includes(token(999)) === true
  );
  app.release();
  await (await oldResponse).finished();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(app.errors).toEqual([]);
});

test('empty invitation lists leave the ordinary empty folder state usable', async ({
  page,
}) => {
  await setup(page, { empty: true });
  await page.goto('/travel-record');
  await expect(
    page.getByText('아직 추가한 여행 기록이 없어요', { exact: false })
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('does not fetch invitations without an authenticated user', async ({
  page,
}) => {
  const app = await setup(page, { guest: true });
  await page.goto('/travel-record');
  await expect(page).toHaveURL(/\/login$/);
  expect(
    app.requests.some((req) => req.path.includes('/travel-records/invitations'))
  ).toBe(false);
});
