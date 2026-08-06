import assert from 'node:assert/strict';
import test from 'node:test';

import { toBusinessProfile } from '../src/pages/business-verification/mappers/businessProfile.ts';

test('creates a profile-facing business record from a completed verification form', () => {
  assert.deepEqual(
    toBusinessProfile({
      businessAddress: '경기도 용인시 수지구',
      representativeName: '김여기도',
      registrationNumber: '123-45-67890',
      openedAt: '2024-05-01',
      certificateName: 'certificate.png',
    }),
    {
      businessName: '인증된 사업장',
      businessAddress: '경기도 용인시 수지구',
      representativeName: '김여기도',
      registrationNumber: '123-45-67890',
      openedAt: '2024-05-01',
    }
  );
});
