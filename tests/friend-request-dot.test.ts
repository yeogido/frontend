import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FRIEND_REQUEST_PRESENCE_QUERY_PREFIX,
  getFriendRequestButtonLabel,
  getFriendRequestPresenceQueryKey,
  invalidateFriendRequestPresence,
  isFriendRequestDotPath,
  shouldShowFriendRequestDot,
} from '../src/hooks/utils/friendRequestDot.ts';

const ready = {
  enabled: true,
  isPending: false,
  isError: false,
  requestCount: 1,
};

test('the dot shows only after a successful fetch with at least one request', () => {
  assert.equal(shouldShowFriendRequestDot(ready), true);
  assert.equal(shouldShowFriendRequestDot({ ...ready, requestCount: 3 }), true);
});

test('the dot hides while loading, on error, when disabled or when empty', () => {
  assert.equal(
    shouldShowFriendRequestDot({ ...ready, isPending: true }),
    false
  );
  assert.equal(shouldShowFriendRequestDot({ ...ready, isError: true }), false);
  assert.equal(shouldShowFriendRequestDot({ ...ready, enabled: false }), false);
  assert.equal(
    shouldShowFriendRequestDot({ ...ready, requestCount: 0 }),
    false
  );
});

test('the button label mentions new requests only when there is a dot', () => {
  assert.equal(getFriendRequestButtonLabel(false), '친구 요청');
  assert.equal(getFriendRequestButtonLabel(true), '친구 요청, 새 요청 있음');
});

test('the presence key keeps the user id at index 1 and never matches the list key', () => {
  const key = getFriendRequestPresenceQueryKey(7);
  const listKey = ['friendRequests', 'received', 7];

  assert.deepEqual(key, [FRIEND_REQUEST_PRESENCE_QUERY_PREFIX, 7]);
  assert.equal(key[1], 7);
  assert.notEqual(key[0], listKey[0]);
  // 목록 키를 접두사로 하는 무효화가 점 키를 건드리지 않는다.
  assert.notDeepEqual(key.slice(0, listKey.length), listKey);
  assert.deepEqual(getFriendRequestPresenceQueryKey(null), [
    FRIEND_REQUEST_PRESENCE_QUERY_PREFIX,
    null,
  ]);
});

test('the dot shows on the friends list and profiles but not on the requests page', () => {
  assert.equal(isFriendRequestDotPath('/friends'), true);
  assert.equal(isFriendRequestDotPath('/friends/6'), true);
  assert.equal(isFriendRequestDotPath('/friends/requests'), false);
  assert.equal(isFriendRequestDotPath('/friends/requests/'), false);
  assert.equal(isFriendRequestDotPath('/'), false);
  assert.equal(isFriendRequestDotPath('/profile'), false);
  assert.equal(isFriendRequestDotPath('/friendship'), false);
});

test('the helper invalidates the presence key of that user only', () => {
  const calls: unknown[] = [];

  invalidateFriendRequestPresence(
    {
      invalidateQueries: ((filters: { queryKey: unknown }) => {
        calls.push(filters.queryKey);
        return Promise.resolve();
      }) as never,
    },
    7
  );

  assert.deepEqual(calls, [getFriendRequestPresenceQueryKey(7)]);
});
