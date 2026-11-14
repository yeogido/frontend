import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { leaveTravelRecordWithClient } from '../src/apis/travelRecordsClient.ts';
import { canLeaveTravelRecord } from '../src/pages/travel-record/utils/leavePermission.ts';
import { clearLeftTravelRecordQueries } from '../src/hooks/utils/travelRecordLeaveCache.ts';
import type { TravelRecordFolder } from '../src/pages/travel-record/types';

const session = { userId: 999, authGeneration: 3 };
const folder = {
  id: '20',
  visibility: 'friends',
  owner: { userId: 2 },
  participants: [{ userId: 999 }],
  permissions: { canLeave: true },
} as TravelRecordFolder;

test('leave deletes only the caller membership, with no request body', async () => {
  const calls: unknown[][] = [];
  await leaveTravelRecordWithClient(
    {
      async delete<T>(...args: [string]) {
        calls.push(args);
        return { data: undefined as T };
      },
    },
    20
  );
  assert.deepEqual(calls, [['/travel-records/20/members/me']]);
});

test('leave failures propagate and invalid IDs do not issue requests', async () => {
  const failure = new Error('creator cannot leave');
  await assert.rejects(
    leaveTravelRecordWithClient(
      {
        async delete<T>(): Promise<{ data: T }> {
          throw failure;
        },
      },
      20
    ),
    (error) => error === failure
  );
  for (const id of [0, -1, 1.2, NaN, Infinity]) {
    let called = false;
    await assert.rejects(
      leaveTravelRecordWithClient(
        {
          async delete<T>() {
            called = true;
            return { data: undefined as T };
          },
        },
        id
      )
    );
    assert.equal(called, false);
  }
});

test('only an authorized current FRIENDS participant other than the owner can leave', () => {
  assert.equal(canLeaveTravelRecord(folder, 999), true);
  assert.equal(canLeaveTravelRecord(folder, 2), false);
  assert.equal(canLeaveTravelRecord(folder, 123), false);
  assert.equal(canLeaveTravelRecord(folder, null), false);
  assert.equal(canLeaveTravelRecord(undefined, 999), false);
  for (const visibility of ['private', 'public'] as const)
    assert.equal(canLeaveTravelRecord({ ...folder, visibility }, 999), false);
  assert.equal(
    canLeaveTravelRecord(
      { ...folder, owner: { userId: 999 } as TravelRecordFolder['owner'] },
      999
    ),
    false
  );
  assert.equal(
    canLeaveTravelRecord({ ...folder, owner: undefined }, 999),
    false
  );
  assert.equal(
    canLeaveTravelRecord({ ...folder, participants: [] }, 999),
    false
  );
  assert.equal(
    canLeaveTravelRecord({ ...folder, permissions: undefined }, 999),
    false
  );
  assert.equal(
    canLeaveTravelRecord(
      { ...folder, permissions: { ...folder.permissions!, canLeave: false } },
      999
    ),
    false
  );
  assert.equal(
    canLeaveTravelRecord({ ...folder, id: 'preview-20' }, 999),
    false
  );
});

function seed(client: QueryClient) {
  const list = {
    pages: [
      {
        items: [{ travelRecordId: 20 }, { travelRecordId: 21 }],
        cursorId: 21,
        hasNext: false,
      },
    ],
    pageParams: [{}],
  };
  const keys = {
    list: ['travelRecords', 999, 3, { year: 2026 }],
    oldList: ['travelRecords', 999, 2, { year: 2026 }],
    otherList: ['travelRecords', 2, 3, { year: 2026 }],
    map: ['travelRecordMap', 999, 3, { year: 2026 }],
    years: ['travelRecordYears', 999, 3],
    detail: ['travelRecord', 20, 'folder', 999, 3],
    rawDetail: ['travelRecord', 20, 999, 3],
    otherDetail: ['travelRecord', 20, 'folder', 2, 3],
    oldDetail: ['travelRecord', 20, 'folder', 999, 2],
    friendMap: ['friendTravelMap', 999, 2, 2026],
    otherFriendMap: ['friendTravelMap', 2, 999, 2026],
  };
  for (const key of [keys.list, keys.oldList, keys.otherList])
    client.setQueryData(key, list);
  client.setQueryData(keys.map, [
    { travelRecordId: 20 },
    { travelRecordId: 21 },
  ]);
  client.setQueryData(keys.years, { years: [2026] });
  for (const key of [
    keys.detail,
    keys.rawDetail,
    keys.otherDetail,
    keys.oldDetail,
  ])
    client.setQueryData(key, folder);
  client.setQueryData(keys.friendMap, [{ travelRecordId: 20 }]);
  client.setQueryData(keys.otherFriendMap, [{ travelRecordId: 20 }]);
  return { keys, list };
}

test('successful leave removes only the current session record and refreshes dependent travel caches', async () => {
  const client = new QueryClient();
  const { keys, list } = seed(client);
  await clearLeftTravelRecordQueries(client, 20, session);
  const updated = client.getQueryData<typeof list>(keys.list)!;
  assert.deepEqual(updated.pages[0].items, [{ travelRecordId: 21 }]);
  assert.deepEqual(updated.pageParams, list.pageParams);
  assert.deepEqual(client.getQueryData(keys.map), [{ travelRecordId: 21 }]);
  assert.equal(client.getQueryData(keys.detail), undefined);
  assert.equal(client.getQueryData(keys.rawDetail), undefined);
  assert.equal(client.getQueryData(keys.friendMap), undefined);
  for (const key of [
    keys.otherDetail,
    keys.oldDetail,
    keys.otherFriendMap,
    keys.otherList,
    keys.oldList,
  ])
    assert.notEqual(client.getQueryData(key), undefined);
  assert.deepEqual(client.getQueryData(keys.otherList), list);
  assert.equal(client.getQueryState(keys.years)?.isInvalidated, true);
  assert.equal(client.getQueryState(keys.list)?.isInvalidated, true);
  assert.equal(client.getQueryState(keys.map)?.isInvalidated, true);
  client.clear();
});

test('a pending list read cannot restore the left record after cleanup', async () => {
  const client = new QueryClient();
  const { keys, list } = seed(client);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pending = client
    .fetchQuery({
      queryKey: keys.list,
      queryFn: async () => {
        await gate;
        return list;
      },
    })
    .catch(() => undefined);
  await clearLeftTravelRecordQueries(client, 20, session);
  release();
  await pending;
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(
    client.getQueryData<typeof list>(keys.list)?.pages[0].items,
    [{ travelRecordId: 21 }]
  );
  client.clear();
});

test('cleanup does not change caches when its session is no longer current', async () => {
  const client = new QueryClient();
  const { keys, list } = seed(client);
  await clearLeftTravelRecordQueries(client, 20, session, () => false);
  assert.deepEqual(client.getQueryData(keys.list), list);
  assert.equal(client.getQueryData(keys.detail), folder);
  assert.equal(client.getQueryState(keys.years)?.isInvalidated, false);
  client.clear();
});

test('a pre-leave years response cannot restore stale years and clear invalidation', async () => {
  const client = new QueryClient();
  const { keys } = seed(client);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pending = client
    .fetchQuery({
      queryKey: keys.years,
      queryFn: async () => {
        await gate;
        return { years: [2026] };
      },
    })
    .catch(() => undefined);
  await clearLeftTravelRecordQueries(client, 20, session);
  release();
  await pending;
  assert.equal(client.getQueryState(keys.years)?.isInvalidated, true);
  client.clear();
});
