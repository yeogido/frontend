import { expect, test } from '@playwright/test';

for (const status of [200, 500]) {
  test(`blocks verification while resending (HTTP ${status})`, async ({ page }) => {
    let sendCount = 0;
    let verifyCount = 0;
    let releaseResend!: () => void;
    const resendPending = new Promise<void>((resolve) => {
      releaseResend = resolve;
    });

    await page.route('**/auth/password/send-code', async (route) => {
      sendCount += 1;
      if (sendCount === 2) await resendPending;
      await route.fulfill({ status: sendCount === 1 ? 200 : status, json: {} });
    });
    await page.route('**/auth/password/verify-code', async (route) => {
      verifyCount += 1;
      await route.fulfill({ json: { resetToken: 'test-token' } });
    });

    await page.goto('/forgot-password');
    await page.getByPlaceholder('이메일').fill('test@example.com');
    await page.getByRole('button', { name: '인증번호 전송' }).click();
    const code = page.getByPlaceholder('인증번호');
    await expect(code).toBeVisible();
    await page.getByRole('button', { name: '인증번호 전송' }).click();
    await code.fill('123456');
    const verify = page.getByRole('button', { name: '인증하기' });
    await expect(verify).toBeDisabled();
    await code.press('Enter');
    expect(verifyCount).toBe(0);

    releaseResend();
    await expect(verify).toBeEnabled();
    await verify.click();
    await expect(page.getByRole('button', { name: '비밀번호 재설정하기' })).toBeEnabled();
    expect(verifyCount).toBe(1);
  });
}
