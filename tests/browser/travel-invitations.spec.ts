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
    failContent = false,
    heldUpload = false,
    ownerId = 999,
    emptyFriends = false,
  } = {}
) {
  const creates: unknown[] = [];
  const visibilityChanges: unknown[] = [];
  const updates: Array<Record<string, unknown>> = [];
  const invites: unknown[] = [];
  const errors: string[] = [];
  let detailReads = 0;
  let uploads = 0;
  let releaseUpload: (() => void) | undefined;
  const uploadGate = heldUpload
    ? new Promise<void>((resolve) => {
        releaseUpload = resolve;
      })
    : Promise.resolve();
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
      canLinkShare: visibility === 'PUBLIC',
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
    if (url.pathname.endsWith('/regions/popular'))
      return route.fulfill({ json: { result: [] } });
    if (url.pathname.endsWith('/regions'))
      return route.fulfill({ json: { result: { regions: [] } } });
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
      if (detail.visibility === 'PUBLIC') {
        detail.visibility = 'FRIENDS';
        detail.version += 1;
        detail.permissions.canLinkShare = false;
      }
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
    if (
      url.pathname.endsWith('/travel-records/20') &&
      req.method() === 'PATCH'
    ) {
      const body = req.postDataJSON();
      updates.push(body);
      if (failContent)
        return fail('TRAVEL_RECORD4091', '기록 수정에 실패했어요.');
      if (body.version !== detail.version)
        return fail('TRAVEL_RECORD4091', '버전이 다릅니다.');
      detail.version += 1;
      return json({ travelRecordId: 20 });
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
  await page.route('**/mock-upload', async (route) => {
    uploads++;
    await uploadGate;
    return route.fulfill({ status: 200, body: '' });
  });
  return {
    getUploads: () => uploads,
    releaseUpload: () => releaseUpload?.(),
    creates,
    updates,
    visibilityChanges,
    getDetailReads: () => detailReads,
    invites,
    errors,
    recover: () => {
      failInvite = false;
      failMore = false;
      failContent = false;
    },
    hold: () => {
      invitationGate = new Promise<void>((resolve) => {
        releaseInvitation = resolve;
      });
      return () => releaseInvitation?.();
    },
  };
}

async function openCreation(page: Page, save = true) {
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
  await page.goto(
    save
      ? '/travel-record/folder-decoration'
      : '/travel-record/photo-selection',
    {
      waitUntil: 'domcontentloaded',
    }
  );
  if (save)
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

for (const visibility of ['PUBLIC']) {
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

for (const visibility of ['PUBLIC', 'FRIENDS']) {
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
      (page.viewportSize()!.width >= 1024
        ? 48
        : (48 * dialogBox!.width) / 342) - 1
    );
    await expect(
      dialog.getByRole('button', { name: '보내기', exact: true })
    ).toBeDisabled();
    await page.screenshot({
      path: `C:/yeogido/.tmp-empty-share-${visibility}-${testInfo.project.name}.png`,
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

async function openEditPhotos(page: Page) {
  await page.goto('/travel-record/20');
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await expect(page.getByRole('menuitem', { name: /로 전환$/ })).toHaveCount(0);
  await page.getByRole('menuitem', { name: '수정', exact: true }).click();
  await expect(page).toHaveURL(/\/travel-record\/20\/edit$/);
  await page.goto('/travel-record/20/edit/photos');
  await expect(
    page.getByRole('button', { name: '폴더 꾸미기', exact: true })
  ).toBeEnabled();
}

for (const [visibility, label] of [
  ['PRIVATE', '나만 보기'],
  ['FRIENDS', '친구 공개'],
  ['PUBLIC', '전체 공개'],
] as const) {
  test(`사진 단계에서 ${visibility} 선택으로 생성하며 자동 초대하지 않는다`, async ({
    page,
  }, info) => {
    const app = await setup(page);
    await openCreation(page, false);
    const group = page.getByRole('radiogroup', { name: '공개범위 설정' });
    await expect(group).toBeVisible({ timeout: 2000 });
    await expect(
      group.getByRole('radio', { name: '나만 보기', exact: true })
    ).toBeChecked();
    await group.getByRole('radio', { name: label, exact: true }).click();
    await expect(
      group.getByRole('radio', { name: label, exact: true })
    ).toBeChecked();
    expect(app.creates).toHaveLength(0);
    await page.screenshot({
      path: `C:/yeogido/visibility-${visibility}-${info.project.name}.png`,
    });
    await page.locator('input[type=file]').setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fixture'),
    });
    await page
      .getByRole('button', { name: '폴더 꾸미기', exact: true })
      .click();
    await page
      .getByRole('button', { name: '기록 저장하기', exact: true })
      .click();
    await expect(page).toHaveURL(/\/travel-record$/);
    expect(app.creates).toEqual([expect.objectContaining({ visibility })]);
    expect(app.invites).toHaveLength(0);
    expect(app.errors).toEqual([]);
  });
}

test('사진 단계 공개범위 선택은 새로고침과 꾸미기에서 뒤로 이동해도 유지한다', async ({
  page,
}) => {
  const app = await setup(page);
  await openCreation(page, false);
  await page.getByRole('radio', { name: '전체 공개', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('radio', { name: '전체 공개', exact: true })
  ).toBeChecked();
  await page.locator('input[type=file]').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fixture'),
  });
  await page.getByRole('button', { name: '폴더 꾸미기', exact: true }).click();
  await expect(page).toHaveURL(/\/folder-decoration$/);
  await page.goBack();
  await expect(
    page.getByRole('radio', { name: '전체 공개', exact: true })
  ).toBeChecked();
  expect(app.creates).toHaveLength(0);
});

for (const [visibility, initialLabel, next, nextLabel] of [
  ['PRIVATE', '나만 보기', 'PUBLIC', '전체 공개'],
  ['PUBLIC', '전체 공개', 'PRIVATE', '나만 보기'],
] as const) {
  test(`${visibility} 생성자는 수정 플로우 저장 시 공개범위와 반환 버전으로 내용을 저장한다`, async ({
    page,
  }) => {
    const app = await setup(page, { visibility });
    await openEditPhotos(page);
    await expect(
      page.getByRole('radio', { name: initialLabel, exact: true })
    ).toBeChecked();
    await expect(
      page.getByRole('radio', { name: '친구 공개', exact: true })
    ).toBeDisabled();
    await page.getByRole('radio', { name: nextLabel, exact: true }).click();
    expect(app.visibilityChanges).toHaveLength(0);
    await page
      .getByRole('button', { name: '폴더 꾸미기', exact: true })
      .click();
    await page
      .getByRole('button', { name: '기록 저장하기', exact: true })
      .click();
    await expect(page).toHaveURL(/\/travel-record$/);
    expect(app.visibilityChanges).toEqual([{ visibility: next, version: 0 }]);
    expect(app.updates).toEqual([expect.objectContaining({ version: 1 })]);
    expect(app.updates[0]).not.toHaveProperty('visibility');
    expect(app.creates).toHaveLength(0);
    expect(app.errors).toEqual([]);
  });
}

for (const ownerId of [999, 123]) {
  test(`FRIENDS 수정에서 상태는 유지되며 참여자 ${ownerId}는 공개범위를 바꾸지 않는다`, async ({
    page,
  }) => {
    const app = await setup(page, { visibility: 'FRIENDS', ownerId });
    await openEditPhotos(page);
    await expect(
      page.getByRole('radio', { name: '친구 공개', exact: true })
    ).toBeChecked();
    for (const radio of await page.getByRole('radio').all())
      await expect(radio).toBeDisabled();
    await page
      .getByRole('button', { name: '폴더 꾸미기', exact: true })
      .click();
    await page
      .getByRole('button', { name: '기록 저장하기', exact: true })
      .click();
    await expect(page).toHaveURL(/\/travel-record$/);
    expect(app.visibilityChanges).toHaveLength(0);
    expect(app.updates).toEqual([expect.objectContaining({ version: 0 })]);
  });
}

test('수정 플로우에서 공개범위 409는 내용을 저장하거나 자동 재시도하지 않는다', async ({
  page,
}) => {
  const app = await setup(page, {
    visibility: 'PRIVATE',
    failVisibility: true,
  });
  await openEditPhotos(page);
  await page.getByRole('radio', { name: '전체 공개', exact: true }).click();
  await page.getByRole('button', { name: '폴더 꾸미기', exact: true }).click();
  await page
    .getByRole('button', { name: '기록 저장하기', exact: true })
    .click();
  await expect(
    page.getByText('다른 변경사항이 반영되었습니다.', { exact: true })
  ).toBeVisible();
  await expect(page).toHaveURL(/\/edit\/decorate$/);
  expect(app.visibilityChanges).toEqual([{ visibility: 'PUBLIC', version: 0 }]);
  expect(app.updates).toHaveLength(0);
});

test('공개범위 변경 뒤 내용 수정 실패는 안내하고 새 버전으로 내용만 재시도한다', async ({
  page,
}) => {
  const app = await setup(page, { visibility: 'PRIVATE', failContent: true });
  await openEditPhotos(page);
  await page.getByRole('radio', { name: '전체 공개', exact: true }).click();
  await page.getByRole('button', { name: '폴더 꾸미기', exact: true }).click();
  await page
    .getByRole('button', { name: '기록 저장하기', exact: true })
    .click();
  await expect(page.getByText(/공개범위는 변경됐지만/)).toBeVisible();
  expect(app.visibilityChanges).toHaveLength(1);
  app.recover();
  await page
    .getByRole('button', { name: '기록 저장하기', exact: true })
    .click();
  await expect(page).toHaveURL(/\/travel-record$/);
  expect(app.visibilityChanges).toHaveLength(1);
  expect(app.updates).toEqual([
    expect.objectContaining({ version: 1 }),
    expect.objectContaining({ version: 1 }),
  ]);
  expect(app.errors).toEqual([]);
});

test('생성 업로드 중 계정이 바뀌면 이전 공개범위로 새 계정의 앨범을 생성하지 않는다', async ({
  page,
}) => {
  const app = await setup(page, { heldUpload: true });
  await openCreation(page, false);
  await page.getByRole('radio', { name: '전체 공개', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles([
    {
      name: 'first.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fixture'),
    },
    {
      name: 'second.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fixture'),
    },
  ]);
  await page.getByRole('button', { name: '폴더 꾸미기', exact: true }).click();
  await page
    .getByRole('button', { name: '기록 저장하기', exact: true })
    .click();
  await expect.poll(app.getUploads).toBe(1);
  await page.evaluate(async () => {
    const { useAuthStore } = await import('/src/store/auth.store.ts');
    useAuthStore.getState().setAuth({
      userId: 1111,
      accessToken: 'fixture-new-user',
      refreshToken: 'fixture',
      role: 'USER',
    });
  });
  const uploaded = page.waitForResponse(
    (response) =>
      response.url().endsWith('/mock-upload') && response.status() === 200
  );
  app.releaseUpload();
  await uploaded;
  await page.waitForTimeout(150);
  expect(app.getUploads()).toBe(1);
  expect(app.creates).toHaveLength(0);
  await expect(
    page.getByText('여행 기록이 저장되었어요.', { exact: true })
  ).toHaveCount(0);
  await expect(page).toHaveURL(/\/folder-decoration$/);
  expect(app.errors).toEqual([]);
});

test('PUBLIC 친구 초대 성공 후 상세를 다시 받아 FRIENDS와 링크 공유 차단을 반영한다', async ({
  page,
}) => {
  const app = await setup(page, { visibility: 'PUBLIC' });
  await page.goto('/travel-record/20');
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  const dialog = page.getByRole('dialog', {
    name: '여행 폴더 공유',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: '링크 복사', exact: true })
  ).toBeEnabled();
  await expect(dialog.getByRole('button', { name: '친구3 선택' })).toBeEnabled({
    timeout: 2000,
  });
  await dialog.getByRole('button', { name: '친구3 선택' }).click();
  await dialog.getByRole('button', { name: '보내기', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(app.getDetailReads).toBeGreaterThan(1);
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  await expect(
    dialog.getByRole('button', { name: '링크 복사', exact: true })
  ).toBeDisabled();
  // A pending invitation does not create membership: the friend is still available to select.
  await expect(
    dialog.getByRole('button', { name: '친구3 선택' })
  ).toBeEnabled();
  expect(app.invites).toEqual([{ inviteeUserIds: [3] }]);
  expect(app.creates).toEqual([]);
  expect(app.visibilityChanges).toEqual([]);
  expect(app.updates).toEqual([]);
  expect(app.errors).toEqual([]);
});

test('PUBLIC 친구 초대 실패는 PUBLIC과 선택을 유지하고 재시도 성공 후에만 FRIENDS로 바뀐다', async ({
  page,
}) => {
  const app = await setup(page, { visibility: 'PUBLIC', failInvite: true });
  await page.goto('/travel-record/20');
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  const dialog = page.getByRole('dialog', {
    name: '여행 폴더 공유',
    exact: true,
  });
  await expect(dialog.getByRole('button', { name: '친구3 선택' })).toBeEnabled({
    timeout: 2000,
  });
  await dialog.getByRole('button', { name: '친구3 선택' }).click();
  await dialog.getByRole('button', { name: '보내기', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('이미 수락 대기');
  await expect(
    dialog.getByRole('button', { name: '링크 복사', exact: true })
  ).toBeEnabled();
  await expect(
    dialog.getByRole('button', { name: '친구3 선택' })
  ).toHaveAttribute('aria-pressed', 'true');
  expect(app.invites).toHaveLength(1);
  app.recover();
  await dialog.getByRole('button', { name: '보내기', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  await expect(
    dialog.getByRole('button', { name: '링크 복사', exact: true })
  ).toBeDisabled();
  expect(app.invites).toHaveLength(2);
  expect(app.visibilityChanges).toEqual([]);
  expect(app.errors).toEqual([]);
});

test('saving survives a mobile desktop layout switch without a second creation', async ({
  page,
}) => {
  const app = await setup(page, { heldUpload: true });
  await openCreation(page, false);
  await page.locator('input[type=file]').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fixture'),
  });
  await page.getByRole('button', { name: '폴더 꾸미기', exact: true }).click();
  await page
    .getByRole('button', { name: '기록 저장하기', exact: true })
    .click();
  await expect.poll(app.getUploads).toBe(1);
  await page.setViewportSize({
    width: page.viewportSize()!.width < 1024 ? 1280 : 390,
    height: 900,
  });
  await expect(
    page.getByRole('button', { name: '기록 저장하기', exact: true })
  ).toBeDisabled();
  app.releaseUpload();
  await expect(page).toHaveURL(/\/travel-record$/, { timeout: 4000 });
  expect(app.creates).toHaveLength(1);
  expect(app.errors).toEqual([]);
});
