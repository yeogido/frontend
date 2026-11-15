import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldRetryFriendsQuery } from '../src/hooks/utils/friendRetry.ts';

test('does not retry when the request itself was rejected', () => {
  for (const status of [400, 401, 403, 404, 429, 499]) {
    assert.equal(
      shouldRetryFriendsQuery(0, {
        code: 'COMMON4002',
        message: '요청 파라미터가 올바르지 않습니다.',
        status,
      }),
      false,
      `status ${status}`
    );
  }
});

test('retries a server error once', () => {
  const error = { code: 'COMMON500', message: '서버 오류', status: 500 };

  assert.equal(shouldRetryFriendsQuery(0, error), true);
  assert.equal(shouldRetryFriendsQuery(1, error), false);
});

test('retries a network failure without a status once', () => {
  const error = { code: 'NETWORK_ERROR', message: 'Network Error' };

  assert.equal(shouldRetryFriendsQuery(0, error), true);
  assert.equal(shouldRetryFriendsQuery(1, error), false);
});

test('treats anything it cannot read a status from as retryable once', () => {
  assert.equal(shouldRetryFriendsQuery(0, new Error('boom')), true);
  assert.equal(shouldRetryFriendsQuery(0, undefined), true);
  assert.equal(shouldRetryFriendsQuery(0, { status: '404' }), true);
  assert.equal(shouldRetryFriendsQuery(1, new Error('boom')), false);
});

test('does not read 3xx or 5xx boundaries as client errors', () => {
  assert.equal(shouldRetryFriendsQuery(0, { status: 399 }), true);
  assert.equal(shouldRetryFriendsQuery(0, { status: 500 }), true);
});
