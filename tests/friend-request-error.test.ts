import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALREADY_HANDLED_MESSAGE,
  getFriendRequestFailure,
} from '../src/pages/friends/utils/friendRequestError.ts';

const FALLBACK = '친구 요청 수락에 실패했어요.';

test('treats an already handled request as already handled', () => {
  assert.deepEqual(
    getFriendRequestFailure(
      { code: 'FRIEND4094', message: '이미 처리된 요청입니다.', status: 409 },
      FALLBACK
    ),
    { isAlreadyHandled: true, message: ALREADY_HANDLED_MESSAGE }
  );
});

test('treats a request that no longer exists as already handled', () => {
  assert.deepEqual(
    getFriendRequestFailure(
      { code: 'FRIEND4042', message: '요청이 없습니다.', status: 404 },
      FALLBACK
    ),
    { isAlreadyHandled: true, message: ALREADY_HANDLED_MESSAGE }
  );
});

test('recognizes the code on an Error object', () => {
  const error = Object.assign(new Error('x'), { code: 'FRIEND4094' });

  assert.equal(getFriendRequestFailure(error, FALLBACK).isAlreadyHandled, true);
});

test('keeps the general failure for the other friend request codes', () => {
  for (const code of ['FRIEND4031', 'FRIEND4032', 'COMMON4002']) {
    const failure = getFriendRequestFailure(
      { code, message: '서버 메시지', status: 403 },
      FALLBACK
    );

    assert.equal(failure.isAlreadyHandled, false, code);
    assert.equal(failure.message, '서버 메시지', code);
  }
});

test('falls back to the given message for network and unknown errors', () => {
  assert.deepEqual(
    getFriendRequestFailure(new Error('Network Error'), FALLBACK),
    {
      isAlreadyHandled: false,
      message: FALLBACK,
    }
  );
  assert.deepEqual(getFriendRequestFailure(undefined, FALLBACK), {
    isAlreadyHandled: false,
    message: FALLBACK,
  });
  assert.deepEqual(
    getFriendRequestFailure({ code: 'HTTP_500', message: 'boom' }, FALLBACK),
    { isAlreadyHandled: false, message: FALLBACK }
  );
});
