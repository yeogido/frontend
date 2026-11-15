import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSendRequestOutcome,
  SEND_REQUEST_FAILURE_MESSAGE,
} from '../src/pages/friends/utils/friendSendError.ts';

const apiError = (code: string, message = '서버 메시지') => ({
  code,
  message,
  status: 409,
});

test('FRIEND4092 means the request was already sent', () => {
  assert.deepEqual(getSendRequestOutcome(apiError('FRIEND4092')), {
    outcome: 'ALREADY_REQUESTED',
    message: '이미 친구 요청을 보냈어요.',
  });
});

test('FRIEND4091 means they are already friends', () => {
  assert.deepEqual(getSendRequestOutcome(apiError('FRIEND4091')), {
    outcome: 'ALREADY_FRIEND',
    message: '이미 친구예요.',
  });
});

test('FRIEND4093 means the other user already sent a request', () => {
  assert.deepEqual(getSendRequestOutcome(apiError('FRIEND4093')), {
    outcome: 'ALREADY_RECEIVED',
    message: '상대방이 이미 친구 요청을 보냈어요. 수락해 주세요.',
  });
});

test('FRIEND4041 means the user does not exist', () => {
  assert.deepEqual(getSendRequestOutcome(apiError('FRIEND4041')), {
    outcome: 'NOT_FOUND',
    message: '존재하지 않는 사용자예요.',
  });
});

test('FRIEND4001 means the user targeted themselves', () => {
  assert.deepEqual(getSendRequestOutcome(apiError('FRIEND4001')), {
    outcome: 'SELF',
    message: '나에게는 친구 요청을 보낼 수 없어요.',
  });
});

test('other server errors use the server message', () => {
  assert.deepEqual(
    getSendRequestOutcome(apiError('COMMON5000', '서버 오류예요.')),
    { outcome: 'FAILED', message: '서버 오류예요.' }
  );
});

test('an unknown error falls back to the default message', () => {
  assert.equal(getSendRequestOutcome(new Error('boom')).outcome, 'FAILED');
  assert.equal(
    getSendRequestOutcome(undefined).message,
    SEND_REQUEST_FAILURE_MESSAGE
  );
});
