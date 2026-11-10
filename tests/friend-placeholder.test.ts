import assert from 'node:assert/strict';
import test from 'node:test';

import { keepFriendsPlaceholderData } from '../src/hooks/utils/friendPlaceholder.ts';

const previousData = { pages: ['previous'] };

test('keeps the previous data when the user is the same', () => {
  assert.equal(
    keepFriendsPlaceholderData(
      previousData,
      { queryKey: ['friends', 1, ''] },
      1
    ),
    previousData
  );
});

test('keeps the previous data when only the keyword changed', () => {
  assert.equal(
    keepFriendsPlaceholderData(
      previousData,
      { queryKey: ['friends', 1, '김'] },
      1
    ),
    previousData
  );
});

test('drops the previous data when the user changed', () => {
  assert.equal(
    keepFriendsPlaceholderData(
      previousData,
      { queryKey: ['friends', 1, ''] },
      2
    ),
    undefined
  );
});

test('returns undefined when there is no previous query', () => {
  assert.equal(
    keepFriendsPlaceholderData(previousData, undefined, 1),
    undefined
  );
  assert.equal(keepFriendsPlaceholderData(undefined, undefined, 1), undefined);
});

test('returns undefined when the current user is null', () => {
  assert.equal(
    keepFriendsPlaceholderData(
      previousData,
      { queryKey: ['friends', 1, ''] },
      null
    ),
    undefined
  );
  assert.equal(
    keepFriendsPlaceholderData(
      previousData,
      { queryKey: ['friends', null, ''] },
      null
    ),
    undefined
  );
});

test('drops the previous data when the previous query had no user', () => {
  assert.equal(
    keepFriendsPlaceholderData(
      previousData,
      { queryKey: ['friends', null, ''] },
      1
    ),
    undefined
  );
});
