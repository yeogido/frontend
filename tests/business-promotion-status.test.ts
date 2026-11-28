import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areAllBusinessesPromoting,
  checkSelectedBusiness,
  isBusinessPromoting,
  isBusinessSelectable,
  normalizeBusinessInfo,
} from '../src/utils/businessPromotionStatus.ts';

const raw = {
  businessInfoId: 1,
  businessNumber: '1234567890',
  businessName: '웨이브온 커피',
  businessAddress: '부산 기장군 장안읍 해맞이로 286',
  representativeName: '홍길동',
  verifiedAt: '2026-07-26T15:30:00',
};

const promoting = { hasActivePromotion: true };
const idle = { hasActivePromotion: false };

test('a business with an active promotion is promoting and not selectable', () => {
  assert.equal(isBusinessPromoting(promoting), true);
  assert.equal(isBusinessSelectable(promoting), false);
});

test('a business without an active promotion can be selected', () => {
  assert.equal(isBusinessPromoting(idle), false);
  assert.equal(isBusinessSelectable(idle), true);
});

test('all businesses promoting only when every one is promoting', () => {
  assert.equal(areAllBusinessesPromoting([promoting, promoting]), true);
  assert.equal(areAllBusinessesPromoting([promoting, idle]), false);
  assert.equal(areAllBusinessesPromoting([idle]), false);
});

test('no businesses at all is not "all promoting"', () => {
  assert.equal(areAllBusinessesPromoting([]), false);
});

test('normalizing keeps true and turns a missing or null flag into false', () => {
  assert.equal(
    normalizeBusinessInfo({ ...raw, hasActivePromotion: true })
      .hasActivePromotion,
    true
  );
  assert.equal(
    normalizeBusinessInfo({ ...raw, hasActivePromotion: false })
      .hasActivePromotion,
    false
  );
  assert.equal(normalizeBusinessInfo(raw).hasActivePromotion, false);
  assert.equal(
    normalizeBusinessInfo({ ...raw, hasActivePromotion: null })
      .hasActivePromotion,
    false
  );
});

test('normalizing keeps the other fields untouched', () => {
  const normalized = normalizeBusinessInfo({
    ...raw,
    hasActivePromotion: true,
  });

  assert.equal(normalized.businessInfoId, 1);
  assert.equal(normalized.businessName, '웨이브온 커피');
  assert.equal(normalized.verifiedAt, '2026-07-26T15:30:00');
});

const listed = [
  { businessInfoId: 1, hasActivePromotion: false },
  { businessInfoId: 2, hasActivePromotion: true },
];

test('no selection needs nothing, whatever the list status', () => {
  for (const listStatus of ['loading', 'error', 'ready'] as const) {
    assert.equal(
      checkSelectedBusiness({
        selectedBusinessId: null,
        listStatus,
        businesses: listed,
      }),
      'none'
    );
  }
});

test('a selection stays unverified while the list is loading', () => {
  assert.equal(
    checkSelectedBusiness({
      selectedBusinessId: 1,
      listStatus: 'loading',
      businesses: [],
    }),
    'unverified'
  );
});

test('a selection stays unverified when the list failed to load', () => {
  assert.equal(
    checkSelectedBusiness({
      selectedBusinessId: 2,
      listStatus: 'error',
      businesses: listed,
    }),
    'unverified'
  );
});

test('a selection that is on the loaded list and idle can proceed', () => {
  assert.equal(
    checkSelectedBusiness({
      selectedBusinessId: 1,
      listStatus: 'ready',
      businesses: listed,
    }),
    'selectable'
  );
});

test('a selection missing from the loaded list is released', () => {
  assert.equal(
    checkSelectedBusiness({
      selectedBusinessId: 99,
      listStatus: 'ready',
      businesses: listed,
    }),
    'release'
  );
});

test('a selection that became promoting is released', () => {
  assert.equal(
    checkSelectedBusiness({
      selectedBusinessId: 2,
      listStatus: 'ready',
      businesses: listed,
    }),
    'release'
  );
});
