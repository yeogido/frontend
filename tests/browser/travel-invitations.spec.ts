import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const token = `e30.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: '999' })).toString('base64url')}.test`;
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="coral"/></svg>'
  );

async function setup(
  page: Page,
  {
    canInvite = true,
    visibility = 'FRIENDS',
    failInvite = false,
    failMore = false,
    failVisibility = false,
    ownerId = 999,
    emptyFriends = false,
  } = {}
) {
  const creates: unknown[] = [];
  const visibilityChanges: unknown[] = [];
  const invites: unknown[] = [];
  const errors: string[] = [];
  let detailReads = 0;
  let releaseInvitation: (() => void) | undefined;
  let invitationGate: Promise<void> | undefined;
  const detail = {
    travelRecordId: 20,
    title: '부산',
    regionId: 2,
    startDate: '2026-08-17',
    endDate: '2026-08-18',
    folderTheme: 'BASIC',
    createdAt: '',
    coverImageUrl: photo,
    visibility,
    version: 0,
    owner: { userId: ownerId, nickname: '나', profileImageUrl: null },
    participants: [{ userId: 2, nickname: '참여자', profileImageUrl: null }],
    permissions: {
      canEdit: true,
      canDelete: true,
      canLeave: false,
      canInvite,
      canLinkShare: false,
    },
    images: [
      {
        imageId: 1,
        imageKey: 'travel-records/test.png',
        imageUrl: photo,
        imageOrder: 1,
      },
    ],
    stickers: [],
  };
  const friend = (id: number) => ({
    userId: id,
    nickname: id === 2 ? '참여자' : `친구${id}`,
    profileImageUrl: null,
    friendCode: `CODE${id}`,
  });
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
  }, token);
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (result: unknown) =>
      route.fulfill({
        json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
      });
    const fail = (code: string, message: string) =>
      route.fulfill({
        status: 409,
        json: { isSuccess: false, code, message, result: null },
      });
    const empty = {
      items: [],
      cursorValue: null,
      cursorId: null,
      hasNext: false,
    };
    if (url.pathname.endsWith('/visibility') && req.method() === 'PATCH') {
      visibilityChanges.push(req.postDataJSON());
      if (failVisibility)
        return fail('TRAVEL_RECORD4091', '다른 변경사항이 반영되었습니다.');
      detail.visibility = (
        req.postDataJSON() as { visibility: string }
      ).visibility;
      detail.version += 1;
      return json({
        travelRecordId: 20,
        visibility: detail.visibility,
        version: detail.version,
      });
    }
    if (url.pathname.endsWith('/invitations') && req.method() === 'POST') {
      invites.push(req.postDataJSON());
      await invitationGate;
      if (failInvite)
        return fail(
          'TRAVEL_RECORD4092',
          '이미 수락 대기 중인 초대가 있습니다.'
        );
      return json({
        travelRecordId: 20,
        invitations: [
          {
            invitationId: 10,
            inviteeUserId: 3,
            status: 'PENDING',
            createdAt: '',
          },
        ],
      });
    }
    if (url.pathname.endsWith('/travel-records') && req.method() === 'POST') {
      creates.push(req.postDataJSON());
      return json({
        travelRecordId: 20,
        title: '부산',
        visibility: (req.postDataJSON() as { visibility: string }).visibility,
        version: 0,
      });
    }
    if (url.pathname.endsWith('/travel-records/20')) {
      detailReads += 1;
      return json(detail);
    }
    if (url.pathname.endsWith('/travel-records') && req.method() === 'GET') {
      return json({ ...empty, items: [detail] });
    }
    if (url.pathname.endsWith('/friends')) {
      if (emptyFriends) return json(empty);
      if (url.searchParams.has('cursorId')) {
        if (failMore)
          return route.fulfill({
            status: 500,
            json: {
              isSuccess: false,
              code: 'COMMON5001',
              message: '추가 조회 실패',
              result: null,
            },
          });
        return json({ ...empty, items: [friend(4)] });
      }
      return json({
        items: [friend(2), friend(3)],
        cursorValue: '친구3',
        cursorId: 3,
        hasNext: true,
      });
    }
    if (url.pathname.endsWith('/files/presigned-url'))
      return json({
        objectKey: 'travel-records/test.png',
        uploadUrl: 'http://127.0.0.1:5181/mock-upload',
      });
    if (url.pathname.endsWith('/regions/2'))
      return json({ regionId: 2, name: '부산', fullName: '부산광역시' });
    if (url.pathname.endsWith('/stickers')) return json({ items: [] });
    if (url.pathname.endsWith('/years')) return json({ years: [2026] });
    if (url.pathname.endsWith('/users/me'))
      return json({
        userId: 999,
        name: '나',
        role: 'USER',
        profileImageUrl: null,
      });
    return json(empty);
  });
  await page.route('**/mock-upload', (route) =>
    route.fulfill({ status: 200, body: '' })
  );
  return {
    creates,
    visibilityChanges,
    getDetailReads: () => detailReads,
    invites,
    errors,
    recover: () => {
      failInvite = false;
      failMore = false;
    },
    hold: () => {
      invitationGate = new Promise<void>((resolve) => {
        releaseInvitation = resolve;
      });
      return () => releaseInvitation?.();
    },
  };
}

async function openCreation(page: Page) {
  await page.goto('/travel-record', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    const { saveTravelRecordPhotoDraft } =
      await import('/src/pages/travel-record/utils/travelRecordSave.ts');
    const { saveTravelRecordDraftRegion, saveTravelRecordDraftDateRange } =
      await import('/src/pages/travel-record/utils/draftStorage.ts');
    saveTravelRecordDraftRegion({
      id: '2',
      regionId: 2,
      name: '부산',
      province: '부산',
      selectionName: '부산',
    });
    saveTravelRecordDraftDateRange({
      startDate: new Date(2026, 7, 17),
      endDate: new Date(2026, 7, 18),
    });
    await saveTravelRecordPhotoDraft([
      {
        source: 'new',
        file: new File(['fixture'], 'test.png', { type: 'image/png' }),
      },
    ]);
  });
  await page.goto('/travel-record/folder-decoration', {
    waitUntil: 'domcontentloaded',
  });
  await page
    .getByRole('button', { name: '기록 저장하기', exact: true })
    .click();
}

test('기존 FRIENDS 폴더의 초대 실패·재시도는 앨범을 생성하지 않는다', async ({
  page,
}, testInfo) => {
  const app = await setup(page, { failInvite: true });
  await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  const dialog = page.getByRole('dialog', {
    name: '여행 폴더 공유',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.screenshot({
    path: `C:/yeogido/.tmp-album-invite-${testInfo.project.name}.png`,
  });
  expect(app.creates).toHaveLength(0);
  await expect(dialog.getByRole('button', { name: '참여자 선택' })).toHaveCount(
    0
  );
  await dialog.getByRole('button', { name: '친구3 선택' }).click();
  await dialog.getByRole('button', { name: '보내기', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('이미 수락 대기');
  expect(app.invites).toEqual([{ inviteeUserIds: [3] }]);
  app.recover();
  await dialog.getByRole('button', { name: '보내기', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(app.creates).toHaveLength(0);
  expect(app.invites).toHaveLength(2);
  await expect(page).toHaveURL(/\/travel-record\/20$/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  await expect(dialog).toBeVisible();
  expect(app.creates).toHaveLength(0);
  expect(app.errors).toEqual([]);
});

test('새 폴더는 선택 팝업 없이 PRIVATE로 바로 저장한다', async ({ page }) => {
  const app = await setup(page, { visibility: 'PRIVATE', canInvite: false });
  await openCreation(page);
  await expect(page).toHaveURL(/\/travel-record$/);
  await expect(
    page.getByRole('dialog', { name: '폴더를 어떻게 저장할까요?' })
  ).toHaveCount(0);
  expect(app.creates).toEqual([
    expect.objectContaining({ visibility: 'PRIVATE' }),
  ]);
  expect(app.invites).toHaveLength(0);
});

test('생성자는 기존 메뉴에서 상세의 버전으로 전체공개 전환한다', async ({
  page,
}, testInfo) => {
  const app = await setup(page, { visibility: 'PRIVATE', canInvite: false });
  await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await page.screenshot({
    path: `C:/yeogido/.tmp-public-menu-${testInfo.project.name}.png`,
  });
  await page
    .getByRole('menuitem', { name: '전체공개로 전환', exact: true })
    .click();
  await expect(
    page.getByText('전체공개로 전환했어요.', { exact: true })
  ).toBeVisible();
  expect(app.visibilityChanges).toEqual([{ visibility: 'PUBLIC', version: 0 }]);
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await expect(
    page.getByRole('menuitem', { name: '전체공개로 전환', exact: true })
  ).toHaveCount(0);
  expect(app.invites).toHaveLength(0);
});

for (const visibility of ['PRIVATE', 'PUBLIC', 'FRIENDS']) {
  test(`${visibility} 목록 카드에 공개범위에 맞는 아이콘을 표시한다`, async ({
    page,
  }, testInfo) => {
    await setup(page, { visibility });
    await page.goto('/travel-record', { waitUntil: 'domcontentloaded' });
    const title = page.getByRole('heading', { name: /부산$/ });
    await expect(title).toBeVisible();
    await expect(title.getByRole('img', { name: '나만보기 앨범' })).toHaveCount(
      visibility === 'PRIVATE' ? 1 : 0
    );
    await expect(title.getByRole('img', { name: '친구공유 앨범' })).toHaveCount(
      visibility === 'FRIENDS' ? 1 : 0
    );
    if (visibility === 'PRIVATE') {
      const icon = title.getByRole('img', { name: '나만보기 앨범' });
      await expect(icon).toBeVisible();
      await expect(icon).toHaveJSProperty('naturalWidth', 18);
      await page.screenshot({
        path: `C:/yeogido/.tmp-private-folder-${testInfo.project.name}.png`,
      });
    }
  });
}

test('생성자는 전체공개 폴더를 나만보기로 전환하고 새 버전으로 다시 공개한다', async ({
  page,
}) => {
  const app = await setup(page, { visibility: 'PUBLIC', canInvite: false });
  await page.goto('/travel-record', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '부산 여행 기록 상세 보기' }).click();
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await page
    .getByRole('menuitem', { name: '나만보기로 전환', exact: true })
    .click();
  await expect(
    page.getByText('나만보기로 전환했어요.', { exact: true })
  ).toBeVisible();
  expect(app.visibilityChanges).toEqual([
    { visibility: 'PRIVATE', version: 0 },
  ]);
  await page.goBack();
  await expect(
    page
      .getByRole('heading', { name: /부산$/ })
      .getByRole('img', { name: '나만보기 앨범' })
  ).toBeVisible();
  await page.getByRole('button', { name: '부산 여행 기록 상세 보기' }).click();
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await expect(
    page.getByRole('menuitem', { name: '나만보기로 전환', exact: true })
  ).toHaveCount(0);
  await page
    .getByRole('menuitem', { name: '전체공개로 전환', exact: true })
    .click();
  await expect(
    page.getByText('전체공개로 전환했어요.', { exact: true })
  ).toBeVisible();
  expect(app.visibilityChanges).toEqual([
    { visibility: 'PRIVATE', version: 0 },
    { visibility: 'PUBLIC', version: 1 },
  ]);
  await page.goBack();
  await expect(page.getByRole('heading', { name: /부산$/ })).toBeVisible();
  await expect(page.getByRole('img', { name: '나만보기 앨범' })).toHaveCount(0);
  expect(app.errors).toEqual([]);
});

for (const visibility of ['PRIVATE', 'PUBLIC']) {
  test(`${visibility} 전환 버전 충돌은 자동 재시도하거나 성공 처리하지 않는다`, async ({
    page,
  }) => {
    const app = await setup(page, {
      visibility,
      canInvite: false,
      failVisibility: true,
    });
    await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
    const label =
      visibility === 'PRIVATE' ? '전체공개로 전환' : '나만보기로 전환';
    await page.getByRole('menuitem', { name: label, exact: true }).click();
    await expect(
      page.getByText('다른 변경사항이 반영되었습니다.', { exact: true })
    ).toBeVisible();
    expect(app.visibilityChanges).toHaveLength(1);
    expect(app.getDetailReads()).toBe(1);
    await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
    await expect(
      page.getByRole('menuitem', { name: label, exact: true })
    ).toBeVisible();
  });
}

for (const visibility of ['PRIVATE', 'PUBLIC']) {
  test(`${visibility} 타인 소유 폴더에는 공개범위 전환을 표시하지 않는다`, async ({
    page,
  }) => {
    const app = await setup(page, {
      visibility,
      canInvite: false,
      ownerId: 123,
    });
    await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
    await expect(
      page.getByRole('menuitem', { name: /^(전체공개|나만보기)로 전환$/ })
    ).toHaveCount(0);
    expect(app.visibilityChanges).toHaveLength(0);
  });
}

test('권한이 없어도 공유 버튼은 유지하고 팝업 안에서 초대를 제한한다', async ({
  page,
}) => {
  const app = await setup(page, { canInvite: false });
  await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('region', { name: '부산 여행 사진' })
  ).toBeVisible();
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  const dialog = page.getByRole('dialog', { name: '여행 폴더 공유' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('status')).toHaveCount(0);
  await expect(
    dialog.getByRole('button', { name: '보내기', exact: true })
  ).toBeDisabled();
  expect(app.invites).toHaveLength(0);
  await dialog.getByRole('button', { name: '공유 창 닫기' }).click();
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await expect(
    page.getByRole('menuitem', { name: '전체공개로 전환', exact: true })
  ).toHaveCount(0);
});

for (const visibility of ['PRIVATE', 'PUBLIC']) {
  test(`${visibility} 폴더의 공유 팝업은 임의 안내 없이 기존 UI를 유지한다`, async ({
    page,
  }) => {
    const app = await setup(page, { visibility, canInvite: false });
    await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
    const dialog = page.getByRole('dialog', { name: '여행 폴더 공유' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('status')).toHaveCount(0);
    await expect(
      dialog.getByRole('list', { name: '외부 앱으로 공유' })
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: '보내기', exact: true })
    ).toBeDisabled();
    expect(app.invites).toHaveLength(0);
  });
}

for (const visibility of ['PRIVATE', 'PUBLIC', 'FRIENDS']) {
  test(`${visibility} 친구가 없을 때 프로필 영역과 보내기 버튼을 유지한다`, async ({
    page,
  }, testInfo) => {
    const app = await setup(page, { visibility, emptyFriends: true });
    await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
    const dialog = page.getByRole('dialog', { name: '여행 폴더 공유' });
    await expect(
      dialog.getByText('친구에게 공유', { exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByText('아직 등록된 친구가 없어요.', { exact: true })
    ).toBeVisible();
    const row = dialog.getByRole('list', { name: '초대할 친구' });
    await expect(row).toBeVisible();
    const rowBox = await row.boundingBox();
    const dialogBox = await dialog.boundingBox();
    expect(rowBox!.height).toBeGreaterThanOrEqual(
      (48 * dialogBox!.width) / 342 - 1
    );
    await expect(
      dialog.getByRole('button', { name: '보내기', exact: true })
    ).toBeDisabled();
    if (visibility === 'PRIVATE')
      await page.screenshot({
        path: `C:/yeogido/.tmp-empty-share-${testInfo.project.name}.png`,
      });
    expect(app.invites).toHaveLength(0);
  });
}

test('추가 친구 페이지 실패 후 재시도하며 이미 선택한 친구를 유지한다', async ({
  page,
}) => {
  const app = await setup(page, { failMore: true });
  await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  const dialog = page.getByRole('dialog', { name: '여행 폴더 공유' });
  await dialog.getByRole('button', { name: '친구3 선택' }).click();
  await dialog.getByRole('button', { name: '친구 더 보기' }).click();
  await expect(
    dialog.getByRole('button', { name: '친구 더 보기 다시 시도' })
  ).toBeVisible();
  app.recover();
  await dialog.getByRole('button', { name: '친구 더 보기 다시 시도' }).click();
  await expect(
    dialog.getByRole('button', { name: '친구4 선택' })
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: '친구3 선택' })
  ).toHaveAttribute('aria-pressed', 'true');
  const release = app.hold();
  await dialog.getByRole('button', { name: '보내기', exact: true }).click();
  try {
    await expect(
      dialog.getByRole('button', { name: '보내는 중', exact: true })
    ).toBeDisabled();
    await expect(
      dialog.getByRole('button', { name: '공유 창 닫기' })
    ).toBeDisabled();
    await page.keyboard.press('Tab');
    await expect(dialog).toBeFocused();
  } finally {
    release();
  }
  await expect(dialog).toHaveCount(0);
  expect(app.invites).toHaveLength(1);
});
