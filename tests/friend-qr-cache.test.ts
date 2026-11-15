import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FRIENDSHIP_QUERY_PREFIXES,
  getFriendTravelInvalidationKeys,
  getFriendshipInvalidationKeys,
  invalidateFriendshipQueries,
} from '../src/hooks/friendQueryKeys.ts';
import { getFriendRequestPresenceQueryKey } from '../src/hooks/utils/friendRequestDot.ts';

test('the friendship keys cover lists, search, profile, travel and requests', () => {
  const keys = getFriendshipInvalidationKeys(7, 42);

  assert.deepEqual(keys, [
    ['friends', 7],
    ['friendSearch', 7],
    ['friendProfile', 7],
    ...getFriendTravelInvalidationKeys(7, 42),
    ['friendRequests', 'received', 7],
    ['friendRequests', 'sent', 7],
  ]);
});

test('the prefixes keep their expected names', () => {
  assert.deepEqual(FRIENDSHIP_QUERY_PREFIXES, {
    friends: 'friends',
    friendSearch: 'friendSearch',
    friendProfile: 'friendProfile',
    friendRequests: 'friendRequests',
  });
});

test('the helper invalidates every key and the presence key after cancelling it', async () => {
  const calls: [string, unknown][] = [];

  await invalidateFriendshipQueries(
    {
      cancelQueries: ((filters: { queryKey: unknown }) => {
        calls.push(['cancel', filters.queryKey]);
        return Promise.resolve();
      }) as never,
      invalidateQueries: ((filters: { queryKey: unknown }) => {
        calls.push(['invalidate', filters.queryKey]);
        return Promise.resolve();
      }) as never,
    },
    7,
    42
  );

  assert.deepEqual(
    calls.filter(([type]) => type === 'invalidate').slice(0, -1),
    getFriendshipInvalidationKeys(7, 42).map((key) => ['invalidate', key])
  );
  assert.deepEqual(calls.slice(-2), [
    ['cancel', getFriendRequestPresenceQueryKey(7)],
    ['invalidate', getFriendRequestPresenceQueryKey(7)],
  ]);
});
