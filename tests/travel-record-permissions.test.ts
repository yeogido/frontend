import assert from 'node:assert/strict';
import test from 'node:test';

import { getTravelRecordActionPermissions } from '../src/pages/travel-record/utils/travelRecordPermissions.ts';
import type { TravelRecordFolder } from '../src/pages/travel-record/types.ts';

const owner = { userId: 1, nickname: '작성자', profileImageUrl: null };
const member = { userId: 2, nickname: '참여자', profileImageUrl: null };

const permissions = (canEdit: boolean, canDelete: boolean) => ({
  canEdit,
  canDelete,
  canLeave: false,
  canInvite: false,
  canLinkShare: false,
});

const makeFolder = (
  overrides: Partial<TravelRecordFolder> = {}
): Pick<TravelRecordFolder, 'permissions' | 'owner'> => ({
  owner,
  ...overrides,
});

test('with permissions, only canEdit is allowed', () => {
  assert.deepEqual(
    getTravelRecordActionPermissions(
      makeFolder({ permissions: permissions(true, false) }),
      2
    ),
    { canEdit: true, canDelete: false }
  );
});

test('with permissions, only canDelete is allowed', () => {
  assert.deepEqual(
    getTravelRecordActionPermissions(
      makeFolder({ permissions: permissions(false, true) }),
      2
    ),
    { canEdit: false, canDelete: true }
  );
});

test('with permissions, both are allowed', () => {
  assert.deepEqual(
    getTravelRecordActionPermissions(
      makeFolder({ permissions: permissions(true, true) }),
      1
    ),
    { canEdit: true, canDelete: true }
  );
});

test('with permissions, neither is allowed even for the owner', () => {
  assert.deepEqual(
    getTravelRecordActionPermissions(
      makeFolder({ permissions: permissions(false, false) }),
      1
    ),
    { canEdit: false, canDelete: false }
  );
});

test('without permissions, the owner can edit and delete', () => {
  assert.deepEqual(getTravelRecordActionPermissions(makeFolder(), 1), {
    canEdit: true,
    canDelete: true,
  });
});

test('without permissions, a participant can do neither', () => {
  assert.deepEqual(
    getTravelRecordActionPermissions(makeFolder({ participants: [member] }), 2),
    { canEdit: false, canDelete: false }
  );
});

test('a missing user id allows nothing', () => {
  assert.deepEqual(getTravelRecordActionPermissions(makeFolder(), null), {
    canEdit: false,
    canDelete: false,
  });
  assert.deepEqual(
    getTravelRecordActionPermissions(makeFolder({ owner: undefined }), null),
    { canEdit: false, canDelete: false }
  );
});

test('a missing folder allows nothing', () => {
  assert.deepEqual(getTravelRecordActionPermissions(undefined, 1), {
    canEdit: false,
    canDelete: false,
  });
  assert.deepEqual(getTravelRecordActionPermissions(undefined, null), {
    canEdit: false,
    canDelete: false,
  });
});
