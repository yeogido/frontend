import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFriendQrUrl,
  formatCountdown,
  getQrExpiresAt,
  getRemainingSeconds,
  getValidQrToken,
  isQrExpired,
  QR_VALID_SECONDS,
} from '../src/pages/friends/utils/friendQrCountdown.ts';

test('expires 180 seconds after the request started', () => {
  assert.equal(QR_VALID_SECONDS, 180);
  assert.equal(getQrExpiresAt(1_000), 181_000);
});

test('counts the full 180 seconds right after the request started', () => {
  assert.equal(getRemainingSeconds(getQrExpiresAt(1_000), 1_000), 180);
});

test('rounds the remaining time up to whole seconds', () => {
  assert.equal(getRemainingSeconds(10_000, 9_001), 1);
  assert.equal(getRemainingSeconds(10_000, 9_000), 1);
  assert.equal(getRemainingSeconds(10_000, 8_999), 2);
});

test('stops at zero at and after the expiry', () => {
  assert.equal(getRemainingSeconds(10_000, 10_000), 0);
  assert.equal(getRemainingSeconds(10_000, 10_001), 0);
  assert.equal(getRemainingSeconds(10_000, 99_999), 0);
});

test('is expired exactly at the expiry time and not before', () => {
  assert.equal(isQrExpired(10_000, 9_999), false);
  assert.equal(isQrExpired(10_000, 10_000), true);
  assert.equal(isQrExpired(10_000, 10_001), true);
});

test('formats the countdown as mm:ss', () => {
  assert.equal(formatCountdown(180), '03:00');
  assert.equal(formatCountdown(179), '02:59');
  assert.equal(formatCountdown(60), '01:00');
  assert.equal(formatCountdown(59), '00:59');
  assert.equal(formatCountdown(1), '00:01');
  assert.equal(formatCountdown(0), '00:00');
});

test('formats invalid seconds as 00:00', () => {
  assert.equal(formatCountdown(-5), '00:00');
  assert.equal(formatCountdown(Number.NaN), '00:00');
});

test('builds the QR URL with the token encoded', () => {
  assert.equal(
    buildFriendQrUrl('https://yeogido.kr', 'abc123'),
    'https://yeogido.kr/friends/add?qr=abc123'
  );
  assert.equal(
    buildFriendQrUrl('http://localhost:5173', 'a+b/c=d&e'),
    'http://localhost:5173/friends/add?qr=a%2Bb%2Fc%3Dd%26e'
  );
});

test('accepts a non-blank string as the QR token', () => {
  assert.equal(getValidQrToken('abc123'), 'abc123');
});

test('rejects a missing, null, empty or blank QR token', () => {
  assert.equal(getValidQrToken(undefined), null);
  assert.equal(getValidQrToken(null), null);
  assert.equal(getValidQrToken(''), null);
  assert.equal(getValidQrToken('   '), null);
  assert.equal(getValidQrToken('\n\t'), null);
});

test('rejects a QR token that is not a string', () => {
  assert.equal(getValidQrToken(123), null);
  assert.equal(getValidQrToken({}), null);
});

test('does not build a QR URL without a valid token', () => {
  assert.equal(buildFriendQrUrl('https://yeogido.kr', undefined), null);
  assert.equal(buildFriendQrUrl('https://yeogido.kr', null), null);
  assert.equal(buildFriendQrUrl('https://yeogido.kr', ''), null);
  assert.equal(buildFriendQrUrl('https://yeogido.kr', '  '), null);
});

test('a slow response shortens the remaining time instead of extending it', () => {
  const requestedAt = 1_000;
  const respondedAt = requestedAt + 5_000;

  assert.equal(
    getRemainingSeconds(getQrExpiresAt(requestedAt), respondedAt),
    175
  );
});
