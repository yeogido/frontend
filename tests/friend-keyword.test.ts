import assert from 'node:assert/strict';
import test from 'node:test';

import { toFriendKeyword } from '../src/pages/friends/utils/friendKeyword.ts';

test('trims the search input', () => {
  assert.equal(toFriendKeyword('  김여기도  '), '김여기도');
  assert.equal(toFriendKeyword('ABC91G23'), 'ABC91G23');
});

test('turns an empty or blank input into no keyword', () => {
  assert.equal(toFriendKeyword(''), undefined);
  assert.equal(toFriendKeyword('   '), undefined);
  assert.equal(toFriendKeyword('\t\n'), undefined);
});

test('keeps spaces inside the keyword', () => {
  assert.equal(toFriendKeyword(' 김 여기도 '), '김 여기도');
});
