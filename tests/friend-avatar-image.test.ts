import assert from 'node:assert/strict';
import test from 'node:test';

import { getFriendAvatarImageSrc } from '../src/pages/friends/utils/friendAvatarImage.ts';

test('returns null when there is no address', () => {
  assert.equal(getFriendAvatarImageSrc(null), null);
  assert.equal(getFriendAvatarImageSrc(undefined), null);
});

test('returns null for an empty or whitespace-only address', () => {
  assert.equal(getFriendAvatarImageSrc(''), null);
  assert.equal(getFriendAvatarImageSrc('   '), null);
  assert.equal(getFriendAvatarImageSrc('\n\t'), null);
});

test('returns a normal URL as is', () => {
  assert.equal(
    getFriendAvatarImageSrc('https://example.com/a.png'),
    'https://example.com/a.png'
  );
});

test('trims whitespace around the URL', () => {
  assert.equal(
    getFriendAvatarImageSrc('  https://example.com/a.png \n'),
    'https://example.com/a.png'
  );
});
