import { expect, test, type Page } from '@playwright/test';

const photo = (color: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/></svg>`
  );
const images = ['coral', 'blue', 'green', 'gold', 'purple'].map(
  (color, index) => ({
    imageId: index + 1,
    imageKey: `test/${index}.png`,
    imageUrl: photo(color),
    imageOrder: index + 1,
  })
);

async function setup(page: Page, shared = false) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding-dismissed', 'true');
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          userId: 999,
          accessToken: 'e30.eyJleHAiOjk5OTk5OTk5OTl9.eA',
          refreshToken: 'fixture',
          role: 'USER',
          isAuthenticated: true,
          authGeneration: 0,
        },
        version: 4,
      })
    );
  });
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let result: unknown = {
      items: [],
      hasNext: false,
      cursorId: null,
      cursorValue: null,
    };
    if (path.endsWith('/users/me'))
      result = {
        userId: 999,
        name: '테스트',
        role: 'USER',
        profileImageUrl: null,
      };
    else if (path.endsWith('/travel-records/20'))
      result = {
        travelRecordId: 20,
        title: '부산 여행',
        regionId: 2,
        startDate: '2026-08-17',
        endDate: '2026-08-18',
        folderTheme: 'BASIC',
        createdAt: '',
        coverImageUrl: images[0].imageUrl,
        visibility: shared ? 'FRIENDS' : 'PRIVATE',
        version: 0,
        owner: {
          userId: shared ? 2 : 999,
          nickname: '소유자',
          profileImageUrl: null,
        },
        participants: shared
          ? [{ userId: 999, nickname: '참여자', profileImageUrl: null }]
          : [],
        permissions: {
          canEdit: !shared,
          canDelete: !shared,
          canLeave: shared,
          canInvite: !shared,
          canLinkShare: false,
        },
        images,
        stickers: [],
      };
    else if (path.endsWith('/regions/2'))
      result = { regionId: 2, name: '부산', fullName: '부산광역시' };
    await route.fulfill({ json: { result } });
  });
}

test('desktop photo grid and existing actions', async ({ page }) => {
  await setup(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '부산 여행' })).toBeVisible();
  const gallery = page.getByRole('region', { name: '부산 여행 여행 사진' });
  const photoButtons = gallery.getByRole('button');
  await expect(photoButtons).toHaveCount(5);
  const boxes = await photoButtons.evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, height: r.height };
    })
  );
  expect(boxes[0].height).toBeGreaterThan(boxes[1].height * 1.9);
  expect(boxes[1].y).toBe(boxes[2].y);
  await photoButtons.nth(1).click();
  const viewer = page.getByRole('dialog', { name: '부산 여행 여행 사진 보기' });
  await expect(
    viewer.getByRole('img', { name: '부산 여행 여행 사진 2' })
  ).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(
    viewer.getByRole('img', { name: '부산 여행 여행 사진 3' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(photoButtons.nth(1)).toBeFocused();
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  await expect(
    page.getByRole('dialog', { name: '여행 폴더 공유' })
  ).toBeVisible();
  await page.getByRole('button', { name: '공유 창 닫기' }).click();
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: '여행 기록 메뉴' })
  ).toBeFocused();
  await page.getByRole('button', { name: '여행 기록 메뉴' }).click();
  await page.getByRole('menuitem', { name: '삭제' }).click();
  await expect(
    page.getByRole('dialog', { name: '여행 기록을 삭제할까요?' })
  ).toBeVisible();
  await page.getByRole('button', { name: '취소' }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('shared record respects permissions and mobile breakpoint', async ({
  page,
}) => {
  await setup(page, true);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/travel-record/20', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('list', { name: '앨범 참여자' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: '여행 기록 메뉴' })
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  await page.setViewportSize({ width: 1023, height: 900 });
  await expect(
    page.getByRole('button', { name: '여행 기록 메뉴' })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: '부산 여행 여행 사진' })
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});
