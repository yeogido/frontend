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

test('stores role from the login/reissue response in the persisted auth store', () => {
  // login/reissue/social-login/social-signup 응답에 role이 포함되어 있어
  // (스웨거 AuthTokenRes/AuthSocialLoginRes 기준), 서버가 준 값을 그대로
  // 저장한다. 다만 소상공인/관리자 화면을 여는 인가 판단은 여전히
  // GET /users/me(useMyProfile)를 진실의 출처로 쓴다.
  const authStoreSource = readFileSync(
    new URL('../src/store/auth.store.ts', import.meta.url),
    'utf8'
  );

  assert.match(authStoreSource, /role:\s*auth\.role/);
  assert.match(authStoreSource, /version:\s*4/);
  // 옛 세션(role 없음)은 null로 채워야 한다.
  assert.match(authStoreSource, /stored\.role = null/);
});
