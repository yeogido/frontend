import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const token = (id: number) =>
  `e30.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: String(id) })).toString('base64url')}.test`;
const invite = (id: number) => ({
  invitationId: id,
  status: 'PENDING',
  inviter: { userId: 3, nickname: `친구${id}`, profileImageUrl: null },
  owner: { userId: 2, nickname: '생성자', profileImageUrl: null },
  travelRecord: {
    travelRecordId: id + 1000,
    title: `여행${id}`,
    regionId: 2,
    startDate: '2026-08-21',
    endDate: '2026-08-22',
    folderTheme: 'BASIC',
    regionName: '부산시',
    previewImages: [
      { imageUrl: 'https://example.com/preview.jpg', imageOrder: 1 },
    ],
    stickers: [
      {
        recordStickerId: 1,
        stickerId: 2,
        imageUrl: 'https://example.com/sticker.png',
        positionX: 0.5,
        positionY: 0.5,
        rotation: 0,
        scale: 1,
        zIndex: 1,
      },
    ],
    photoCount: 1,
  },
  createdAt: '2026-11-15T12:00:00',
});
const empty = { items: [], cursorId: null, cursorValue: null, hasNext: false };

async function setup(
  page: Page,
  options: {
    held?: boolean;
    failOnce?: boolean;
    heldList?: boolean;
    failNextPage?: boolean;
    guest?: boolean;
  } = {}
) {
  let invitations = [invite(101), invite(100)];
  const accepted = new Set<number>();
  const errors: string[] = [];
  const writes: { id: number; status: string }[] = [];
  let reads = 0;
  let failed = false;
  let nextPageFailed = false;
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    ({ accessToken, guest }) => {
      localStorage.setItem('onboarding-dismissed', 'true');
      if (!guest)
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: {
              userId: 999,
              accessToken,
              refreshToken: 'fixture',
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
    const path = new URL(req.url()).pathname;
    const json = (result: unknown) =>
      route.fulfill({
        json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
      });
    if (path.endsWith('/regions')) return json({ regions: [] });
    if (path.endsWith('/regions/popular')) return json([]);
    if (path.endsWith('/regions/2'))
      return json({ regionId: 2, name: '부산', fullName: '부산광역시' });
    if (path.endsWith('/users/me'))
      return json({
        userId: 999,
        name: '여기도',
        nickname: '여기도',
        role: 'USER',
        profileImageUrl: null,
      });
    if (path.endsWith('/travel-records/invitations')) {
      reads++;
      if (options.heldList) await gate;
      const cursor = Number(new URL(req.url()).searchParams.get('cursor'));
      if (cursor && options.failNextPage && !nextPageFailed) {
        nextPageFailed = true;
        return route.fulfill({
          status: 503,
          json: {
            isSuccess: false,
            code: 'COMMON5031',
            message: '목록 조회 실패',
            result: null,
          },
        });
      }
      const available = invitations.filter(
        (item) => !cursor || item.invitationId < cursor
      );
      const slice = available.slice(0, 10);
      return json({
        ...empty,
        items: req.headers().authorization?.includes(token(1000)) ? [] : slice,
        cursorId: slice.at(-1)?.invitationId ?? null,
        hasNext: available.length > slice.length,
      });
    }
    if (
      /\/travel-records\/invitations\/\d+$/.test(path) &&
      req.method() === 'GET'
    ) {
      const item = invitations.find(
        (value) => value.invitationId === Number(path.split('/').at(-1))
      );
      return item
        ? json(item)
        : route.fulfill({
            status: 404,
            json: {
              isSuccess: false,
              code: 'TRAVEL_RECORD4042',
              message: '없음',
              result: null,
            },
          });
    }
    if (
      /\/travel-records\/invitations\/\d+$/.test(path) &&
      req.method() === 'PATCH'
    ) {
      const id = Number(path.split('/').at(-1));
      const { status } = req.postDataJSON();
      writes.push({ id, status });
      if (options.held) await gate;
      if (options.failOnce && !failed) {
        failed = true;
        return route.fulfill({
          status: 503,
          json: {
            isSuccess: false,
            code: 'COMMON5031',
            message: '잠시 후 다시 시도해 주세요.',
            result: null,
          },
        });
      }
      invitations = invitations.filter((item) => item.invitationId !== id);
      if (status === 'ACCEPTED') accepted.add(id);
      return json({ invitationId: id, travelRecordId: id + 1000, status });
    }
    const record = (id: number) => ({
      travelRecordId: id + 1000,
      title: `여행${id}`,
      regionId: 2,
      startDate: '2026-08-21',
      endDate: '2026-08-22',
      folderTheme: 'BASIC',
      visibility: 'FRIENDS',
      version: 1,
      createdAt: '',
      owner: invite(id).owner,
      participants: [
        { userId: 999, nickname: '여기도', profileImageUrl: null },
      ],
      permissions: {
        canEdit: true,
        canDelete: false,
        canInvite: true,
        canLeave: true,
        canLinkShare: false,
      },
      images: [],
      stickers: [],
    });
    if (path.endsWith('/travel-records'))
      return json({ ...empty, items: [...accepted].map(record) });
    if (path.endsWith('/years'))
      return json({ years: accepted.size ? [2026] : [] });
    if (/\/travel-records\/\d+$/.test(path))
      return json(record(Number(path.split('/').at(-1)) - 1000));
    if (
      /\/courses\/(recommended|popular\/local)$|\/contents\/banner$/.test(path)
    )
      return json([]);
    return json(empty);
  });
  return {
    errors,
    writes,
    reads: () => reads,
    release,
    add: (id: number) => {
      invitations.unshift(invite(id));
    },
    remove: (id: number) => {
      invitations = invitations.filter((item) => item.invitationId !== id);
    },
  };
}

const dialog = (page: Page, id = 101) =>
  page.getByRole('dialog', { name: `친구${id}님과의 공유앨범`, exact: true });

test('shows invitations on an ordinary page and advances only after a successful response', async ({
  page,
}, info) => {
  const app = await setup(page);
  await page.goto('/');
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toContainText('부산시');
  await page.screenshot({
    path: `C:/yeogido/global-invitation-${info.project.name}.png`,
  });
  await dialog(page)
    .getByRole('button', { name: '거절하기', exact: true })
    .click();
  await expect(dialog(page, 100)).toBeVisible();
  expect(app.writes).toEqual([{ id: 101, status: 'DECLINED' }]);
  await dialog(page, 100).getByRole('button', { name: '팝업 닫기' }).click();
  await page.goto('/travel-record');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('여행100');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(app.errors).toEqual([]);
});

test('dismissal preserves all dashed cards across reload and only future invitations reopen automatically', async ({
  page,
}) => {
  const app = await setup(page);
  await page.goto('/travel-record');
  await dialog(page).getByRole('button', { name: '팝업 닫기' }).click();
  await expect(page.getByRole('article', { name: /앨범 초대$/ })).toHaveCount(
    2
  );
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  app.add(102);
  await page.goto('/');
  await expect(dialog(page, 102)).toBeVisible();
  expect(app.writes).toEqual([]);
});

test('new invitations do not replace an open dialog and accepting updates the real folder list', async ({
  page,
}) => {
  const app = await setup(page);
  await page.goto('/');
  await expect(dialog(page)).toBeVisible();
  app.add(102);
  await page.evaluate(() => {
    history.pushState({}, '', '/travel-record');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(dialog(page)).toBeVisible();
  await dialog(page)
    .getByRole('button', { name: '수락하기', exact: true })
    .click();
  await expect(dialog(page, 102)).toBeVisible();
  await expect(page.getByRole('article', { name: /앨범 초대$/ })).toHaveCount(
    2
  );
  await dialog(page, 102).getByRole('button', { name: '팝업 닫기' }).click();
  await expect(
    page.getByRole('button', { name: '여행101 여행 기록 상세 보기' })
  ).toBeVisible();
  expect(app.writes).toEqual([{ id: 101, status: 'ACCEPTED' }]);
});

test('keeps the active invitation when many newer invitations push it onto another page', async ({
  page,
}) => {
  const app = await setup(page);
  await page.goto('/');
  await expect(dialog(page)).toBeVisible();
  for (let id = 102; id <= 113; id++) app.add(id);
  await page.evaluate(() => {
    history.pushState({}, '', '/travel-record');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(
    page.getByRole('article', { name: '친구113님의 여행113 앨범 초대' })
  ).toBeVisible();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page, 113)).toHaveCount(0);
  await dialog(page)
    .getByRole('button', { name: '거절하기', exact: true })
    .click();
  await expect(dialog(page, 113)).toBeVisible();
  expect(app.writes).toEqual([{ id: 101, status: 'DECLINED' }]);
});

test('a later refresh retries a failed page search and drops an invitation resolved elsewhere', async ({
  page,
}) => {
  const app = await setup(page, { failNextPage: true });
  await page.goto('/');
  await expect(dialog(page)).toBeVisible();
  for (let id = 102; id <= 113; id++) app.add(id);
  app.remove(101);
  const failedPage = page.waitForResponse(
    (response) =>
      response.url().includes('/travel-records/invitations?') &&
      response.url().includes('cursor=') &&
      response.status() === 503
  );
  await page.evaluate(() => {
    history.pushState({}, '', '/travel-record');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await failedPage;
  await expect(dialog(page)).toBeVisible();
  await page.evaluate(() => {
    history.pushState({}, '', '/');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(dialog(page, 113)).toBeVisible();
  await expect(dialog(page)).toHaveCount(0);
  expect(app.writes).toEqual([]);
});

test('failed submissions keep the same invitation and allow a manual retry', async ({
  page,
}) => {
  const app = await setup(page, { failOnce: true });
  await page.goto('/');
  await dialog(page)
    .getByRole('button', { name: '수락하기', exact: true })
    .click();
  await expect(
    page.getByText('잠시 후 다시 시도해 주세요.', { exact: true })
  ).toBeVisible();
  await expect(dialog(page)).toBeVisible();
  await dialog(page)
    .getByRole('button', { name: '거절하기', exact: true })
    .click();
  await expect(dialog(page, 100)).toBeVisible();
  expect(app.writes).toHaveLength(2);
});

test('card and popup share one pending response and cannot dismiss during submission', async ({
  page,
}) => {
  const app = await setup(page, { held: true });
  await page.goto('/travel-record');
  await expect(dialog(page)).toBeVisible();
  await page.evaluate(() => {
    (
      document.querySelector(
        'button[aria-label="친구101님의 초대 수락"]'
      ) as HTMLButtonElement
    ).click();
    const popup = document.querySelector('[data-automatic-travel-invitation]');
    const buttons = [...(popup?.querySelectorAll('button') ?? [])];
    buttons.find((button) => button.textContent === '수락하기')?.click();
  });
  await expect.poll(() => app.writes.length).toBe(1);
  await expect(
    dialog(page).getByRole('button', { name: '팝업 닫기' })
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeVisible();
  app.release();
  await expect(dialog(page, 100)).toBeVisible();
  await expect(page.getByRole('article', { name: /앨범 초대$/ })).toHaveCount(
    1
  );
});

test('defers while editing or another dialog is open and then resumes', async ({
  page,
}) => {
  const app = await setup(page);
  await page.goto('/travel-record/new');
  await expect.poll(app.reads).toBeGreaterThan(0);
  await expect(page.getByRole('dialog', { name: /친구101님/ })).toHaveCount(0);
  await page.evaluate(() => {
    const blocker = document.createElement('div');
    blocker.id = 'other-dialog';
    blocker.setAttribute('role', 'dialog');
    blocker.textContent = '다른 작업';
    document.body.append(blocker);
    history.pushState({}, '', '/travel-record');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(dialog(page)).toHaveCount(0);
  await page.evaluate(() => document.getElementById('other-dialog')?.remove());
  await expect(dialog(page)).toBeVisible();
});

test('does not poll while staying on a page and checks again on navigation', async ({
  page,
}) => {
  await page.clock.install();
  const app = await setup(page);
  await page.goto('/');
  await dialog(page).getByRole('button', { name: '팝업 닫기' }).click();
  const before = app.reads();
  app.add(102);
  await page.clock.fastForward(120_000);
  expect(app.reads()).toBe(before);
  await expect(dialog(page, 102)).toHaveCount(0);
  await page.goto('/travel-record');
  await expect(dialog(page, 102)).toBeVisible();
});

test('account changes discard the previous popup and ignore a pending response', async ({
  page,
}) => {
  const app = await setup(page, { held: true });
  await page.goto('/');
  await dialog(page)
    .getByRole('button', { name: '수락하기', exact: true })
    .click();
  await expect.poll(() => app.writes.length).toBe(1);
  await page.evaluate(async (accessToken) => {
    const { useAuthStore } = await import('/src/store/auth.store.ts');
    useAuthStore.getState().setAuth({
      userId: 1000,
      accessToken,
      refreshToken: 'fixture',
      role: 'USER',
    });
  }, token(1000));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  app.release();
  await expect(
    page.getByText('초대를 수락했어요.', { exact: true })
  ).toHaveCount(0);
});

test('does not read invitations for guests', async ({ page }) => {
  const app = await setup(page, { guest: true });
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  expect(app.reads()).toBe(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
