import assert from 'node:assert/strict';
import test from 'node:test';

import { getDetailCompanionBadge } from '../src/pages/detail/mappers/detailCompanionBadge.ts';

test('maps every companion type to its dedicated detail badge icon', () => {
  const expectedIcons = {
    SOLO: 'companion-solo',
    FRIEND: 'companion-friend',
    COUPLE: 'companion-couple',
    FAMILY: 'companion-family',
    PET: 'companion-pet',
  } as const;

  for (const [companionType, expectedIcon] of Object.entries(expectedIcons)) {
    assert.equal(getDetailCompanionBadge(companionType).icon, expectedIcon);
  }
});

test('keeps the group icon fallback for unsupported companion types', () => {
  assert.equal(getDetailCompanionBadge('UNKNOWN').icon, 'group');
  assert.equal(getDetailCompanionBadge('ALONE').icon, 'group');
  assert.equal(getDetailCompanionBadge('CHILDREN').icon, 'group');
});
