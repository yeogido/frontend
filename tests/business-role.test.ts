import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { BUSINESS_ROLE, isBusinessRole } from '../src/utils/role.ts';

test('recognizes the business role regardless of casing', () => {
  assert.equal(BUSINESS_ROLE, 'BUSINESS');
  assert.equal(isBusinessRole('BUSINESS'), true);
  assert.equal(isBusinessRole('business'), true);
});

test('does not open business screens for other roles', () => {
  assert.equal(isBusinessRole('USER'), false);
  assert.equal(isBusinessRole('ADMIN'), false);
  assert.equal(isBusinessRole(''), false);
});

test('stays closed while the profile has not been fetched', () => {
  // 조회 전이거나 실패하면 undefined다. 권한이 열리지 않는 쪽으로 기운다.
  assert.equal(isBusinessRole(undefined), false);
});

test('keeps role out of the persisted auth store', () => {
  // 로그인 응답에 role이 없어 저장해 두면 재로그인 시점에 비워지고, 인증
  // 직후에도 서버와 어긋난다. 서버(GET /users/me)를 진실의 출처로 쓴다.
  const authStoreSource = readFileSync(
    new URL('../src/store/auth.store.ts', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(authStoreSource, /setRole/);
  assert.doesNotMatch(authStoreSource, /role:\s*string/);
  // 이전 버전으로 저장된 role을 떨어뜨리는 migrate가 있어야 한다.
  assert.match(authStoreSource, /version:\s*3/);
  assert.match(authStoreSource, /delete stored\.role/);
});
