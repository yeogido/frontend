import assert from 'node:assert/strict';
import test from 'node:test';

import { getFriendAvatarColor } from '../src/pages/friends/utils/friendAvatarColor.ts';

test('cycles through the four avatar colors in order', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(getFriendAvatarColor), [
    'orange',
    'green',
    'purple',
    'blue',
    'orange',
    'green',
  ]);
});

test('always gives the same color to the same user', () => {
  assert.equal(getFriendAvatarColor(102), getFriendAvatarColor(102));
  assert.equal(getFriendAvatarColor(102), getFriendAvatarColor(106));
});

test('keeps negative ids inside the color range', () => {
  assert.equal(getFriendAvatarColor(-1), 'blue');
  assert.equal(getFriendAvatarColor(-4), 'orange');
});

test('falls back to the first color for ids that are not finite numbers', () => {
  assert.equal(getFriendAvatarColor(Number.NaN), 'orange');
  assert.equal(getFriendAvatarColor(Number.POSITIVE_INFINITY), 'orange');
});

test('drops the fractional part of an id before choosing a color', () => {
  assert.equal(getFriendAvatarColor(1.9), 'green');
});
