import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BUSINESS_VERIFICATION_PATH,
  getProfileBusinessSection,
} from '../src/pages/profile/utils/profileBusinessSection.ts';

const ready = { isLoading: false, isError: false };

test('a regular member without businesses sees the verification banner', () => {
  assert.equal(
    getProfileBusinessSection({ role: 'USER', businessCount: 0, ...ready }),
    'banner'
  );
});

test('a member with verified businesses sees the business card', () => {
  assert.equal(
    getProfileBusinessSection({ role: 'BUSINESS', businessCount: 2, ...ready }),
    'card'
  );
  // 모바일과 같이 사업장이 있으면 role과 무관하게 카드다.
  assert.equal(
    getProfileBusinessSection({ role: 'USER', businessCount: 1, ...ready }),
    'card'
  );
  assert.equal(
    getProfileBusinessSection({ role: 'ADMIN', businessCount: 1, ...ready }),
    'card'
  );
});

test('a business member with no businesses and an admin see nothing', () => {
  assert.equal(
    getProfileBusinessSection({ role: 'BUSINESS', businessCount: 0, ...ready }),
    'none'
  );
  assert.equal(
    getProfileBusinessSection({ role: 'ADMIN', businessCount: 0, ...ready }),
    'none'
  );
});

test('nothing shows until the role is known', () => {
  assert.equal(
    getProfileBusinessSection({
      role: undefined,
      businessCount: 0,
      ...ready,
    }),
    'none'
  );
});

test('nothing shows while the businesses load, so the banner does not flash', () => {
  assert.equal(
    getProfileBusinessSection({
      role: 'USER',
      businessCount: 0,
      isLoading: true,
      isError: false,
    }),
    'none'
  );
});

test('nothing shows when the businesses failed to load', () => {
  assert.equal(
    getProfileBusinessSection({
      role: 'USER',
      businessCount: 0,
      isLoading: false,
      isError: true,
    }),
    'none'
  );
  assert.equal(
    getProfileBusinessSection({
      role: 'BUSINESS',
      businessCount: 1,
      isLoading: false,
      isError: true,
    }),
    'none'
  );
});

test('the entry points to the verification screen', () => {
  assert.equal(BUSINESS_VERIFICATION_PATH, '/business-verification');
});
