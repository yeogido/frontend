import assert from 'node:assert/strict';
import test from 'node:test';

import { isFriendAlreadyDeletedError } from '../src/pages/friends/utils/friendDeleteError.ts';

test('recognizes the error the API returns when the friend is already gone', () => {
  assert.equal(
    isFriendAlreadyDeletedError({
      code: 'FRIEND4043',
      message: '친구 관계가 아닙니다.',
      status: 404,
    }),
    true
  );
});

test('recognizes the code on an Error object', () => {
  const error = Object.assign(new Error('친구 관계가 아니에요.'), {
    code: 'FRIEND4043',
  });

  assert.equal(isFriendAlreadyDeletedError(error), true);
});

test('does not treat other failures as an already deleted friend', () => {
  assert.equal(
    isFriendAlreadyDeletedError({
      code: 'FRIEND4041',
      message: '다른 오류',
      status: 404,
    }),
    false
  );
  assert.equal(
    isFriendAlreadyDeletedError({ code: 'HTTP_500', message: '서버 오류' }),
    false
  );
  assert.equal(isFriendAlreadyDeletedError(new Error('network')), false);
  assert.equal(isFriendAlreadyDeletedError(undefined), false);
  assert.equal(isFriendAlreadyDeletedError('FRIEND4043'), false);
});
