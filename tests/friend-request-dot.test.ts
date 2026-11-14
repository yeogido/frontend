import assert from 'node:assert/strict';
import test from 'node:test';

import { QueryClient, QueryObserver } from '@tanstack/react-query';

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

test('the helper cancels then invalidates the presence key of that user only', async () => {
  const calls: [string, unknown][] = [];

  await invalidateFriendRequestPresence(
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
    7
  );

  assert.deepEqual(calls, [
    ['cancel', getFriendRequestPresenceQueryKey(7)],
    ['invalidate', getFriendRequestPresenceQueryKey(7)],
  ]);
});

// 회귀: 데이터가 없는 최초 조회가 진행 중일 때 invalidate만 하면 새 요청이 시작되지
// 않아 수락 전 응답이 캐시에 남았다.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFirstFetchRace(withCancel: boolean) {
  const queryClient = new QueryClient();
  const queryKey = getFriendRequestPresenceQueryKey(7);
  let calls = 0;
  let server = 'before';
  const observer = new QueryObserver(queryClient, {
    queryKey,
    queryFn: async () => {
      calls += 1;
      const snapshot = server;

      await sleep(30);
      return snapshot;
    },
    retry: false,
  });
  const unsubscribe = observer.subscribe(() => {});

  await sleep(5); // 최초 조회 진행 중
  server = 'after'; // 수락으로 서버 상태가 바뀜

  if (withCancel) {
    await invalidateFriendRequestPresence(queryClient, 7);
  } else {
    await queryClient.invalidateQueries({ queryKey });
  }

  await sleep(100);
  unsubscribe();

  return { calls, data: queryClient.getQueryData(queryKey) };
}

test('invalidating alone during the first fetch keeps the stale response (the bug)', async () => {
  assert.deepEqual(await runFirstFetchRace(false), {
    calls: 1,
    data: 'before',
  });
});

test('the helper leaves the fresh response after a first fetch in flight', async () => {
  assert.deepEqual(await runFirstFetchRace(true), { calls: 2, data: 'after' });
});
