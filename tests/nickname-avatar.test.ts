import assert from 'node:assert/strict';
import test from 'node:test';

import { getNicknameAvatarLabel } from '../src/components/common/nicknameAvatarLabel.ts';

test('shows the last two characters of a name without assuming a surname length', () => {
  assert.equal(getNicknameAvatarLabel('이준혁'), '준혁');
  assert.equal(getNicknameAvatarLabel('준혁'), '준혁');
  assert.equal(getNicknameAvatarLabel('  여행하는고양이  '), '양이');
  assert.equal(getNicknameAvatarLabel('김'), '김');
});

test('preserves complete emoji and combined characters in display names', () => {
  assert.equal(getNicknameAvatarLabel('여행👨‍👩‍👧‍👦🌴'), '👨‍👩‍👧‍👦🌴');
  assert.equal(getNicknameAvatarLabel('Cafe\u0301'), 'fe\u0301');
});

test('uses a placeholder when the name is empty', () => {
  assert.equal(getNicknameAvatarLabel('   '), '?');
});
