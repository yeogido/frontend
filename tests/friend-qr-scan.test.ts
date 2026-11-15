import assert from 'node:assert/strict';
import test from 'node:test';

import {
  QR_ALREADY_FRIEND_MESSAGE,
  QR_INVALID_MESSAGE,
  QR_SELF_MESSAGE,
  QR_USER_NOT_FOUND_MESSAGE,
  getQrScanAction,
  getQrScanError,
  parseQrToken,
} from '../src/pages/friends/utils/friendQrScan.ts';

// normalizeApiError는 { code, message, status } 모양을 그대로 통과시킨다.
const apiError = (code: string, message = '서버 메시지', status = 400) => ({
  code,
  message,
  status,
});

test('parseQrToken returns null when the token is missing or blank', () => {
  assert.equal(parseQrToken(null), null);
  assert.equal(parseQrToken(undefined), null);
  assert.equal(parseQrToken(''), null);
  assert.equal(parseQrToken('   '), null);
});

test('parseQrToken keeps a normal token and trims the edges', () => {
  assert.equal(parseQrToken('abc123'), 'abc123');
  assert.equal(parseQrToken('  abc123 '), 'abc123');
  assert.equal(parseQrToken('a+b/c='), 'a+b/c=');
});

test('FRIEND4044 means the QR is expired or invalid', () => {
  assert.deepEqual(getQrScanError(apiError('FRIEND4044', 'x', 404)), {
    kind: 'invalid',
    message: QR_INVALID_MESSAGE,
  });
});

test('FRIEND4001 means the user scanned their own QR', () => {
  assert.deepEqual(getQrScanError(apiError('FRIEND4001')), {
    kind: 'self',
    message: QR_SELF_MESSAGE,
  });
});

test('FRIEND4091 means the users are already friends', () => {
  assert.deepEqual(getQrScanError(apiError('FRIEND4091', 'x', 409)), {
    kind: 'already-friend',
    message: QR_ALREADY_FRIEND_MESSAGE,
  });
});

test('USER4041 means there is no such user', () => {
  assert.deepEqual(getQrScanError(apiError('USER4041', 'x', 404)), {
    kind: 'not-found-user',
    message: QR_USER_NOT_FOUND_MESSAGE,
  });
});

test('any other error is a generic failure with the server or fallback message', () => {
  assert.deepEqual(getQrScanError(apiError('COMMON5000', '서버 오류', 500)), {
    kind: 'failed',
    message: '서버 오류',
  });
  assert.equal(getQrScanError(new Error('boom'), '대체 문구').kind, 'failed');
});

test('NONE, REQUESTED and RECEIVED all offer "친구 맺기"', () => {
  for (const status of ['NONE', 'REQUESTED', 'RECEIVED'] as const) {
    assert.deepEqual(getQrScanAction(status), {
      kind: 'befriend',
      label: '친구 맺기',
    });
  }
});

test('FRIEND shows that they are already friends', () => {
  assert.deepEqual(getQrScanAction('FRIEND'), {
    kind: 'already-friend',
    label: '이미 친구예요',
  });
});
