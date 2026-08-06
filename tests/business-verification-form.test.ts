import assert from 'node:assert/strict';
import test from 'node:test';

import type { PlaceItem } from '../src/pages/local-recommendation/place-selection/types';
import {
  isBusinessRegistrationNumber,
  isBusinessVerificationSubmittable,
  toBusinessNumber,
} from '../src/pages/business-verification/validation.ts';

const selectedPlace: PlaceItem = {
  id: '123456',
  title: '여기도 식당',
  address: '부산 수영구 광안해변로 219',
  imageSrc: null,
  externalPlaceId: '123456',
  categoryGroupCode: 'FD6',
  roadAddress: '부산 수영구 광안해변로 219',
  lotAddress: '부산 수영구 광안동 192-20',
  latitude: 35.1531698,
  longitude: 129.118666,
};

const completeForm = {
  certificate: {} as File,
  place: selectedPlace,
  businessName: '여기도 식당',
  representativeName: '여기도',
  registrationNumber: '123-45-67890',
  openedAt: '2025-01-01',
};

test('accepts a ten-digit business registration number with optional hyphens', () => {
  assert.equal(isBusinessRegistrationNumber('123-45-67890'), true);
  assert.equal(isBusinessRegistrationNumber('1234567890'), true);
});

test('rejects business registration numbers that are not ten digits', () => {
  assert.equal(isBusinessRegistrationNumber('abc'), false);
  assert.equal(isBusinessRegistrationNumber('123-45-6789'), false);
});

test('strips hyphens so the request matches the ^\\d{10}$ pattern', () => {
  assert.equal(toBusinessNumber('123-45-67890'), '1234567890');
  assert.equal(toBusinessNumber('1234567890'), '1234567890');
});

test('requires non-blank business name and representative name before submission', () => {
  assert.equal(isBusinessVerificationSubmittable(completeForm), true);
  assert.equal(
    isBusinessVerificationSubmittable({ ...completeForm, businessName: '   ' }),
    false
  );
  assert.equal(
    isBusinessVerificationSubmittable({
      ...completeForm,
      representativeName: '   ',
    }),
    false
  );
});

test('blocks submission until a Kakao place is selected', () => {
  // place는 요청 필수값이고 카카오 검색으로만 얻을 수 있다. 주소만 타이핑한
  // 상태로는 externalPlaceId/위경도를 만들 수 없어 제출을 막아야 한다.
  assert.equal(
    isBusinessVerificationSubmittable({ ...completeForm, place: null }),
    false
  );
});

test('blocks submission until the registration certificate is attached', () => {
  assert.equal(
    isBusinessVerificationSubmittable({ ...completeForm, certificate: null }),
    false
  );
});
