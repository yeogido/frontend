import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const token = (id: number) =>
  `e30.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: String(id) })).toString('base64url')}.test`;
const photo =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/%3E';

async function setup(
  page: Page,
  options: {
    visibility?: string;
    ownerId?: number;
    participant?: boolean;
    participantId?: number;
    canLeave?: boolean;
    missingPermissions?: boolean;
    held?: boolean;
    failure?: number;
  } = {}
) {
  const writes: { method: string; path: string; body: string | null }[] = [];
  const errors: string[] = [];
  let left = false;
  let detailReads = 0;
  let failure = options.failure;
  let release!: () => void;
  const gate = options.held
    ? new Promise<void>((resolve) => {
        release = resolve;
      })
    : Promise.resolve();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((accessToken) => {
    localStorage.setItem('onboarding-dismissed', 'true');
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
  }, token(999));

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const json = (result: unknown) =>
      route.fulfill({
        json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
      });
    const empty = {
      items: [],
      cursorId: null,
      cursorValue: null,
      hasNext: false,
    };
    if (req.method() !== 'GET')
      writes.push({ method: req.method(), path, body: req.postData() });
    if (
      path.endsWith('/travel-records/20/members/me') &&
      req.method() === 'DELETE'
    ) {
      await gate;
      if (failure === 0) return route.abort('failed');
      if (failure)
        return route.fulfill({
          status: failure,
          json: {
            isSuccess: false,
            code:
              failure === 409
                ? 'TRAVEL_RECORD4096'
                : failure === 404
                  ? 'TRAVEL_RECORD4041'
                  : 'COMMON4031',
            message: '나가기 요청이 거절됐어요.',
            result: null,
          },
        });
      left = true;
      return json(null);
    }
    if (path.endsWith('/travel-records/20') && req.method() === 'DELETE') {
      left = true;
      return json(null);
    }
    if (/\/travel-records\/(20|21)$/.test(path)) {
      detailReads++;
      const id = path.endsWith('/21') ? 21 : 20;
      const ownerId = options.ownerId ?? 2;
      return json({
        travelRecordId: id,
        title: id === 20 ? '함께 부산' : '다른 여행',
        regionId: 2,
        startDate: '2026-08-17',
        endDate: '2026-08-18',
        folderTheme: 'BASIC',
        visibility: options.visibility ?? 'FRIENDS',
        version: 1,
        createdAt: '',
        coverImageUrl: photo,
        owner: { userId: ownerId, nickname: '생성자', profileImageUrl: null },
        participants:
          options.participant === false
            ? []
            : [
                {
                  userId: options.participantId ?? 999,
                  nickname: '참여자',
                  profileImageUrl: null,
                },
              ],
        permissions: options.missingPermissions
          ? undefined
          : {
              canEdit: true,
              canDelete: ownerId === 999,
              canInvite: false,
              canLeave: options.canLeave ?? true,
              canLinkShare: false,
            },
        images: [
          { imageId: 1, imageKey: 'test.png', imageUrl: photo, imageOrder: 1 },
        ],
        stickers: [],
      });
    }
    if (path.endsWith('/travel-records'))
      return json({
        ...empty,
        items: left
          ? []
          : [
              {
                travelRecordId: 20,
                title: '함께 부산',
                regionId: 2,
                startDate: '2026-08-17',
                endDate: '2026-08-18',
                visibility: 'FRIENDS',
                folderTheme: 'BASIC',
                coverImageUrl: photo,
                createdAt: '',
              },
            ],
      });
    if (path.endsWith('/regions/2'))
      return json({ regionId: 2, name: '부산', fullName: '부산광역시' });
    if (path.endsWith('/years')) return json({ years: left ? [] : [2026] });
    if (path.endsWith('/users/me'))
      return json({
        userId: 999,
        name: '참여자',
        role: 'USER',
        profileImageUrl: null,
      });
    return json(empty);
  });
  await page.goto('/travel-record/20');
  await expect(
    page.getByRole('heading', { name: '함께 부산', exact: true })
  ).toBeVisible();
  const menu = () =>
    page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  return {
    confirmLeave: () =>
      page
        .getByRole('dialog', { name: '공유 폴더에서 나갈까요?' })
        .getByRole('button', { name: '나가기', exact: true })
        .click(),
    writes,
    errors,
    menu,
    release: () => release?.(),
    recover: () => {
      failure = undefined;
    },
    reads: () => detailReads,
  };
}

test('adds leave below edit and delete for an authorized FRIENDS participant', async ({
  page,
}, info) => {
  const app = await setup(page);
  await app.menu();
  await expect(
    page.getByRole('menuitem', { name: '나가기', exact: true })
  ).toBeVisible();
  expect(await page.getByRole('menuitem').allTextContents()).toEqual([
    '수정',
    '삭제',
    '나가기',
  ]);
  const path = `C:/yeogido/travel-leave-${info.project.name}.png`;
  await page.screenshot({ path });
  await info.attach('leave-menu', { path, contentType: 'image/png' });
  expect(app.errors).toEqual([]);
});

for (const [name, options] of [
  ['creator', { ownerId: 999 }],
  ['PRIVATE', { visibility: 'PRIVATE' }],
  ['PUBLIC', { visibility: 'PUBLIC' }],
  ['nonmember', { participant: false }],
  ['permission denied', { canLeave: false }],
  ['permissions missing', { missingPermissions: true }],
] as const) {
  test(`does not offer leave for ${name}`, async ({ page }) => {
    const app = await setup(page, options);
    await app.menu();
    await expect(
      page.getByRole('menuitem', { name: '나가기', exact: true })
    ).toHaveCount(0);
    expect(app.writes).toEqual([]);
  });
}

test('waits for success and sends one membership DELETE before returning to the archive', async ({
  page,
}) => {
  const app = await setup(page, { held: true });
  await app.menu();
  await page.getByRole('menuitem', { name: '나가기', exact: true }).click();
  await page
    .getByRole('dialog', { name: '공유 폴더에서 나갈까요?' })
    .getByRole('button', { name: '나가기', exact: true })
    .evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
  await expect.poll(() => app.writes.length).toBe(1);
  await expect(page).toHaveURL(/\/travel-record\/20$/);
  app.release();
  await expect(page).toHaveURL(/\/travel-record$/);
  await expect(
    page.getByText('폴더에서 나왔어요.', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('함께 부산', { exact: true })).toHaveCount(0);
  expect(app.writes).toEqual([
    {
      method: 'DELETE',
      path: '/api/v1/travel-records/20/members/me',
      body: null,
    },
  ]);
  expect(app.errors).toEqual([]);
});

for (const failure of [0, 403, 404, 409] as const) {
  test(`does not claim success or navigate after ${failure || 'network'} failure and allows retry`, async ({
    page,
  }) => {
    const app = await setup(page, { failure });
    await app.menu();
    await page.getByRole('menuitem', { name: '나가기', exact: true }).click();
    await app.confirmLeave();
    await expect.poll(() => app.writes.length).toBe(1);
    await expect(
      page.getByRole('heading', { name: '함께 부산', exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/travel-record\/20$/);
    await expect(
      page.getByText('폴더에서 나왔어요.', { exact: true })
    ).toHaveCount(0);
    if (failure !== 0) await expect.poll(app.reads).toBeGreaterThan(1);
    app.recover();
    await app.menu();
    await page.getByRole('menuitem', { name: '나가기', exact: true }).click();
    await app.confirmLeave();
    await expect(page).toHaveURL(/\/travel-record$/);
    expect(app.writes).toHaveLength(2);
  });
}

test('ignores an old account leave result after switching accounts', async ({
  page,
}) => {
  const app = await setup(page, { held: true });
  await app.menu();
  await page.getByRole('menuitem', { name: '나가기', exact: true }).click();
  await app.confirmLeave();
  await expect.poll(() => app.writes.length).toBe(1);
  await page.evaluate(async (nextToken) => {
    const modulePath = '/src/store/auth.store.ts';
    const { useAuthStore } = await import(/* @vite-ignore */ modulePath);
    useAuthStore.getState().setAuth({
      userId: 1111,
      accessToken: nextToken,
      refreshToken: 'fixture',
      role: 'USER',
    });
  }, token(1111));
  await expect(
    page.getByRole('heading', { name: '함께 부산', exact: true })
  ).toBeVisible();
  app.release();
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(/\/travel-record\/20$/);
  await expect(
    page.getByText('폴더에서 나왔어요.', { exact: true })
  ).toHaveCount(0);
});

test('does not navigate away from a different folder when a previous leave finishes', async ({
  page,
}) => {
  const app = await setup(page, { held: true });
  await app.menu();
  await page.getByRole('menuitem', { name: '나가기', exact: true }).click();
  await app.confirmLeave();
  await expect.poll(() => app.writes.length).toBe(1);
  await page.evaluate(() => {
    history.pushState({}, '', '/travel-record/21');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(
    page.getByRole('heading', { name: '다른 여행', exact: true })
  ).toBeVisible();
  app.release();
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(/\/travel-record\/21$/);
  await expect(
    page.getByText('폴더에서 나왔어요.', { exact: true })
  ).toHaveCount(0);
  expect(app.errors).toEqual([]);
});

test('confirms leaving and cancel keeps the participant in the folder', async ({
  page,
}, info) => {
  const app = await setup(page);
  await app.menu();
  await page.getByRole('menuitem', { name: '나가기', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '공유 폴더에서 나갈까요?' });
  await expect(dialog).toBeVisible({ timeout: 2000 });
  await expect(dialog).toContainText(
    '나가면 이 폴더를 보거나 수정할 수 없어요.'
  );
  await expect(dialog).toContainText(
    '폴더와 사진·스티커는 다른 참여자에게 그대로 남아요.'
  );
  expect(app.writes).toEqual([]);
  const path = `C:/yeogido/travel-leave-dialog-${info.project.name}.png`;
  await page.screenshot({ path });
  await info.attach('leave-confirmation', { path, contentType: 'image/png' });
  await dialog.getByRole('button', { name: '취소' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/travel-record\/20$/);
  expect(app.writes).toEqual([]);
  expect(app.errors).toEqual([]);
});

test('warns the creator with other participants before deleting the shared folder', async ({
  page,
}, info) => {
  const app = await setup(page, { ownerId: 999, participantId: 1001 });
  await app.menu();
  await page.getByRole('menuitem', { name: '삭제', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '공유 폴더를 삭제할까요?' });
  await expect(dialog).toBeVisible({ timeout: 2000 });
  await expect(dialog).toContainText(
    '삭제하면 모든 참여자가 이 폴더를 볼 수 없어요.'
  );
  await expect(dialog).toContainText(
    '사진·스티커도 함께 삭제되며, 되돌릴 수 없어요.'
  );
  expect(app.writes).toEqual([]);
  const path = `C:/yeogido/travel-delete-dialog-${info.project.name}.png`;
  await page.screenshot({ path });
  await info.attach('shared-delete-confirmation', {
    path,
    contentType: 'image/png',
  });
  await dialog.getByRole('button', { name: '취소' }).click();
  expect(app.writes).toEqual([]);
  await app.menu();
  await page.getByRole('menuitem', { name: '삭제', exact: true }).click();
  await dialog.getByRole('button', { name: '삭제', exact: true }).click();
  await expect(page).toHaveURL(/\/travel-record$/);
  expect(app.writes).toEqual([
    { method: 'DELETE', path: '/api/v1/travel-records/20', body: null },
  ]);
  expect(app.errors).toEqual([]);
});

for (const [name, options] of [
  ['creator alone', { ownerId: 999 }],
  [
    'PUBLIC creator',
    { ownerId: 999, participantId: 1001, visibility: 'PUBLIC' },
  ],
  [
    'PRIVATE creator',
    { ownerId: 999, participantId: 1001, visibility: 'PRIVATE' },
  ],
  ['participant', {}],
] as const) {
  test(`keeps the existing delete message for ${name}`, async ({ page }) => {
    const app = await setup(page, options);
    await app.menu();
    await page.getByRole('menuitem', { name: '삭제', exact: true }).click();
    const dialog = page.getByRole('dialog', {
      name: '여행 기록을 삭제할까요?',
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('삭제한 기록은 되돌릴 수 없어요.');
    await dialog.getByRole('button', { name: '취소' }).click();
    expect(app.writes).toEqual([]);
  });
}
