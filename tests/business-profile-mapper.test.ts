import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatBusinessNumber,
  formatVerifiedAt,
  toBusinessProfile,
} from '../src/pages/business-verification/mappers/businessProfile.ts';
import type { BusinessInfoResponse } from '../src/types/business.type';

const business: BusinessInfoResponse = {
  businessInfoId: 10,
  businessNumber: '1234567890',
  businessName: '여기도 식당',
  businessAddress: '서울특별시 강남구 테헤란로 1',
  representativeName: '홍길동',
  verifiedAt: '2026-07-26T15:30:00',
};

test('formats the hyphen-free business number for display', () => {
  assert.equal(formatBusinessNumber('1234567890'), '123-45-67890');
});

test('leaves unexpected business number shapes untouched', () => {
  assert.equal(formatBusinessNumber('12345'), '12345');
});

test('formats verifiedAt without parsing it as a Date', () => {
  // verifiedAt에는 타임존 오프셋이 없어서 new Date()로 파싱하면 로컬
  // 타임존 해석 때문에 날짜가 밀릴 수 있다.
  assert.equal(formatVerifiedAt('2026-07-26T15:30:00'), '2026.07.26');
  assert.equal(formatVerifiedAt('2026-01-01T00:30:00'), '2026.01.01');
});

test('maps a business list item to the profile shape', () => {
  assert.deepEqual(toBusinessProfile(business), {
    businessName: '여기도 식당',
    businessAddress: '서울특별시 강남구 테헤란로 1',
    representativeName: '홍길동',
    registrationNumber: '123-45-67890',
    // 개업일자는 목록 응답에 없다.
    openedAt: '',
  });
});
