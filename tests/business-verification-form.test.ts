import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isBusinessRegistrationNumber,
  isBusinessVerificationSubmittable,
} from '../src/pages/business-verification/validation.ts';

const completeForm = {
  certificate: {} as File,
  address: '서울특별시 마포구',
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

test('requires non-blank address and representative name before submission', () => {
  assert.equal(isBusinessVerificationSubmittable(completeForm), true);
  assert.equal(
    isBusinessVerificationSubmittable({ ...completeForm, address: '   ' }),
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
