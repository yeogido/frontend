import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

type Mode =
  | 'pending'
  | 'cancel'
  | 'failure'
  | 'unavailable'
  | 'cannotShare'
  | 'kakaoUnavailable';
interface ShareState {
  calls: ShareData[];
  copies: string[];
  kakao: unknown[];
  popups: string[];
  release?: () => void;
}

async function openShare(
  page: Page,
  mode: Mode,
  visibility = 'PUBLIC',
  canLinkShare = true
) {
  const token = `e30.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: '999' })).toString('base64url')}.test`;
  const writes: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.addInitScript(
    ({ token, mode }) => {
      localStorage.setItem('onboarding-dismissed', 'true');
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            userId: 999,
            accessToken: token,
            refreshToken: 'fixture',
            role: 'USER',
            isAuthenticated: true,
            authGeneration: 0,
          },
          version: 4,
        })
      );
      const state: ShareState = {
        calls: [],
        copies: [],
        kakao: [],
        popups: [],
      };
      Object.defineProperty(window, 'Kakao', {
        value: {
          init: () => {},
          isInitialized: () => true,
          Auth: { authorize: () => {} },
          Share:
            mode === 'kakaoUnavailable'
              ? undefined
              : {
                  sendDefault: (data: unknown) => {
                    state.kakao.push(data);
                  },
                },
        },
      });
      Object.defineProperty(window, 'open', {
        configurable: true,
        value: () => ({
          opener: null,
          location: {
            set href(url: string) {
              state.popups.push(url);
            },
          },
        }),
      });
      Object.defineProperty(window, '__webShare', { value: state });
      Object.defineProperty(navigator, 'canShare', {
        configurable: true,
        value: () => mode !== 'cannotShare',
      });
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value:
          mode === 'unavailable'
            ? undefined
            : async (data: ShareData) => {
                state.calls.push(data);
                if (mode === 'cancel')
                  throw new DOMException('Canceled', 'AbortError');
                if (mode === 'failure')
                  throw new DOMException('Not allowed', 'NotAllowedError');
                if (mode === 'pending')
                  await new Promise<void>((resolve) => {
                    state.release = resolve;
                  });
              },
      });
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            state.copies.push(text);
          },
        },
      });
    },
    { token, mode }
  );
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() !== 'GET') writes.push(path);
    const empty = {
      items: [],
      hasNext: false,
      cursorId: null,
      cursorValue: null,
    };
    const result = path.endsWith('/travel-records/20')
      ? {
          travelRecordId: 20,
          title: '부산 여행',
          regionId: 2,
          startDate: '2026-08-17',
          endDate: '2026-08-18',
          visibility,
          version: 3,
          folderTheme: 'BASIC',
          createdAt: '',
          owner: { userId: 999, nickname: '나', profileImageUrl: null },
          participants: [],
          permissions: {
            canEdit: true,
            canDelete: true,
            canLeave: false,
            canInvite: false,
            canLinkShare,
          },
          images: [
            {
              imageId: 1,
              imageKey: 'travel/test.png',
              imageOrder: 1,
              imageUrl:
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/%3E',
            },
          ],
          stickers: [],
        }
      : path.endsWith('/regions/2')
        ? { regionId: 2, name: '부산', fullName: '부산광역시' }
        : path.endsWith('/users/me')
          ? { userId: 999, name: '나', role: 'USER', profileImageUrl: null }
          : empty;
    return route.fulfill({
      json: { isSuccess: true, code: 'COMMON200', message: 'ok', result },
    });
  });
  await page.goto('/travel-record/20?source=test#photo');
  await page.getByRole('button', { name: '여행 폴더 공유하기' }).click();
  return {
    button: page.getByRole('button', { name: '더보기', exact: true }),
    read: () =>
      page.evaluate(() => {
        const state = (window as unknown as { __webShare: ShareState })
          .__webShare;
        return { calls: state.calls, copies: state.copies };
      }),
    writes,
    errors,
  };
}

test('passes canonical folder URL to Web Share and blocks repeat clicks while open', async ({
  page,
}, testInfo) => {
  const app = await openShare(page, 'pending');
  const screenshotPath = testInfo.outputPath('web-share.png');
  await page.screenshot({ path: screenshotPath });
  await testInfo.attach('web-share-button', {
    path: screenshotPath,
    contentType: 'image/png',
  });
  await app.button.click();
  await expect(page.getByRole('button', { name: '더보기' })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: '공유 창 닫기' })
  ).toBeDisabled();
  expect((await app.read()).calls).toEqual([
    {
      title: '부산 여행 | 여기도',
      text: '여기도에서 여행 폴더를 확인해 보세요.',
      url: 'http://127.0.0.1:5181/travel-record/20',
    },
  ]);
  await page.evaluate(() =>
    (window as unknown as { __webShare: ShareState }).__webShare.release?.()
  );
  await expect(app.button).toBeEnabled();
  expect(app.writes).toEqual([]);
  expect(app.errors).toEqual([]);
});

for (const mode of ['unavailable', 'cannotShare'] as const) {
  test(`${mode}: copies the canonical link instead`, async ({ page }) => {
    const app = await openShare(page, mode);
    await app.button.click();
    await expect(
      page.getByText('공유창을 지원하지 않아 링크를 복사했어요.', {
        exact: true,
      })
    ).toBeVisible();
    expect(await app.read()).toEqual({
      calls: [],
      copies: ['http://127.0.0.1:5181/travel-record/20'],
    });
    expect(app.writes).toEqual([]);
  });
}

test('canceling the native share does not copy a link or show an error', async ({
  page,
}) => {
  const app = await openShare(page, 'cancel');
  await app.button.click();
  await expect.poll(async () => (await app.read()).calls.length).toBe(1);
  await expect(app.button).toBeEnabled();
  expect((await app.read()).copies).toEqual([]);
  await expect(
    page.getByText('공유하지 못했어요. 다시 시도해 주세요.')
  ).toHaveCount(0);
});

test('share failure is reported without claiming a successful send', async ({
  page,
}) => {
  const app = await openShare(page, 'failure');
  await app.button.click();
  await expect(
    page.getByText('공유하지 못했어요. 다시 시도해 주세요.', { exact: true })
  ).toBeVisible();
  await expect(app.button).toBeEnabled();
  expect((await app.read()).copies).toEqual([]);
});

for (const [visibility, permission] of [
  ['PRIVATE', true],
  ['FRIENDS', true],
  ['PUBLIC', false],
] as const) {
  test(`blocks native sharing for ${visibility} with canLinkShare=${permission}`, async ({
    page,
  }) => {
    const app = await openShare(page, 'pending', visibility, permission);
    await expect(app.button).toBeDisabled();
    const buttons = page
      .getByRole('list', { name: '외부 앱으로 공유' })
      .getByRole('button');
    for (const button of await buttons.all())
      await expect(button).toBeDisabled();
    expect(await app.read()).toEqual({ calls: [], copies: [] });
    expect(app.writes).toEqual([]);
  });
}

test('shows copy first, direct apps next and native share last with Figma sizes', async ({
  page,
}) => {
  await openShare(page, 'cancel');
  const row = page.getByRole('list', { name: '외부 앱으로 공유' });
  expect(
    await row
      .getByRole('button')
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getAttribute('aria-label'))
      )
  ).toEqual([
    '링크 복사',
    '카카오톡에 공유',
    'X에 공유',
    'Threads에 공유',
    'Tumblr에 공유',
    '더보기',
  ]);
  const sizes = await row.getByRole('button').evaluateAll((buttons) =>
    buttons.map((button) => ({
      w: button.offsetWidth,
      h: button.offsetHeight,
    }))
  );
  expect(sizes).toEqual(Array.from({ length: 6 }, () => ({ w: 48, h: 48 })));
  expect(
    await row
      .getByRole('button', { name: '링크 복사' })
      .locator('img')
      .evaluate((img) => ({ w: img.offsetWidth, h: img.offsetHeight }))
  ).toEqual({ w: 24, h: 24 });
});

test('copy shares only the canonical link and Kakao uses a text template', async ({
  page,
}) => {
  const app = await openShare(page, 'cancel');
  await page.getByRole('button', { name: '링크 복사', exact: true }).click();
  await expect(
    page.getByText('링크를 복사했어요.', { exact: true })
  ).toBeVisible();
  expect((await app.read()).copies).toEqual([
    'http://127.0.0.1:5181/travel-record/20',
  ]);
  await page.getByRole('button', { name: '카카오톡에 공유' }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __webShare: ShareState }).__webShare.kakao
    )
  ).toEqual([
    {
      objectType: 'text',
      text: '부산 여행 | 여기도\n여기도에서 여행 폴더를 확인해 보세요.',
      link: {
        mobileWebUrl: 'http://127.0.0.1:5181/travel-record/20',
        webUrl: 'http://127.0.0.1:5181/travel-record/20',
      },
      buttonTitle: '폴더 보기',
    },
  ]);
  expect((await app.read()).calls).toEqual([]);
  expect(app.writes).toEqual([]);
  expect(app.errors).toEqual([]);
});

test('direct apps open their own composers without invoking native share', async ({
  page,
}) => {
  const app = await openShare(page, 'cancel');
  for (const name of ['X에 공유', 'Threads에 공유', 'Tumblr에 공유']) {
    await page.getByRole('button', { name, exact: true }).click();
  }
  const urls = await page.evaluate(
    () => (window as unknown as { __webShare: ShareState }).__webShare.popups
  );
  expect(
    urls.map((value) => new URL(value).origin + new URL(value).pathname)
  ).toEqual([
    'https://x.com/intent/tweet',
    'https://www.threads.com/intent/post',
    'https://www.tumblr.com/widgets/share/tool',
  ]);
  expect((await app.read()).calls).toEqual([]);
  expect(app.errors).toEqual([]);
});

test('clipboard errors do not claim a successful copy', async ({ page }) => {
  await openShare(page, 'cancel');
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error('denied');
    };
  });
  await page.getByRole('button', { name: '링크 복사', exact: true }).click();
  await expect(
    page.getByText('링크를 복사하지 못했어요. 다시 시도해 주세요.', {
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByText('링크를 복사했어요.', { exact: true })
  ).toHaveCount(0);
});

test('blocked app popup reports a share error', async ({ page }) => {
  await openShare(page, 'cancel');
  await page.evaluate(() => {
    window.open = () => null;
  });
  await page.getByRole('button', { name: 'X에 공유', exact: true }).click();
  await expect(
    page.getByText('공유하지 못했어요. 다시 시도해 주세요.', { exact: true })
  ).toBeVisible();
});

test('Kakao stays disabled when its share module is unavailable', async ({
  page,
}) => {
  await openShare(page, 'kakaoUnavailable');
  await expect(
    page.getByRole('button', { name: '카카오톡에 공유' })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: '링크 복사', exact: true })
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: '더보기', exact: true })
  ).toBeEnabled();
});

test('Kakao errors do not claim a successful send', async ({ page }) => {
  await openShare(page, 'cancel');
  await page.evaluate(() => {
    window.Kakao!.Share!.sendDefault = () => {
      throw new Error('domain unavailable');
    };
  });
  await page.getByRole('button', { name: '카카오톡에 공유' }).click();
  await expect(
    page.getByText('공유하지 못했어요. 다시 시도해 주세요.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '카카오톡에 공유' })
  ).toBeEnabled();
});
