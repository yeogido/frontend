import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FRIEND_TRAVEL_MAP_QUERY_PREFIX,
  FRIEND_TRAVEL_MAP_YEARS_QUERY_PREFIX,
  FRIEND_TRAVEL_QUERY_PREFIXES,
  FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX,
  FRIEND_TRAVEL_RECORDS_QUERY_PREFIX,
  getFriendTravelInvalidationKeys,
  getFriendTravelScopeQueryKey,
  invalidateFriendTravelQueries,
} from '../src/hooks/friendQueryKeys.ts';

test('the scope key puts the viewer id at index 1 and the friend id at index 2', () => {
  assert.deepEqual(getFriendTravelScopeQueryKey('friendTravelMap', 7, 42), [
    'friendTravelMap',
    7,
    42,
  ]);
});

test('invalidation keys cover the map and folder queries for that friend only', () => {
  const keys = getFriendTravelInvalidationKeys(7, 42);

  assert.deepEqual(keys, [
    [FRIEND_TRAVEL_MAP_QUERY_PREFIX, 7, 42],
    [FRIEND_TRAVEL_MAP_YEARS_QUERY_PREFIX, 7, 42],
    [FRIEND_TRAVEL_RECORDS_QUERY_PREFIX, 7, 42],
    [FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX, 7, 42],
  ]);
  assert.deepEqual(
    [
      FRIEND_TRAVEL_RECORDS_QUERY_PREFIX,
      FRIEND_TRAVEL_RECORD_YEARS_QUERY_PREFIX,
    ],
    ['friendTravelRecords', 'friendTravelRecordYears']
  );
  assert.equal(keys.length, FRIEND_TRAVEL_QUERY_PREFIXES.length);
  assert.ok(keys.every((key) => key[1] === 7));
});

test('the invalidation keys are prefixes of the real query keys', () => {
  const mapKey = [FRIEND_TRAVEL_MAP_QUERY_PREFIX, 7, 42, 2025];
  const [mapScope] = getFriendTravelInvalidationKeys(7, 42);

  assert.deepEqual(mapKey.slice(0, mapScope.length), mapScope);

  const recordsKey = [FRIEND_TRAVEL_RECORDS_QUERY_PREFIX, 7, 42, 2025];
  const recordsScope = getFriendTravelInvalidationKeys(7, 42)[2];

  assert.deepEqual(recordsKey.slice(0, recordsScope.length), recordsScope);
});

test('the helper asks the client to invalidate every key', () => {
  const calls: unknown[] = [];

  invalidateFriendTravelQueries(
    {
      invalidateQueries: ((filters: { queryKey: unknown }) => {
        calls.push(filters.queryKey);
        return Promise.resolve();
      }) as never,
    },
    7,
    42
  );

  assert.deepEqual(calls, getFriendTravelInvalidationKeys(7, 42));
});
