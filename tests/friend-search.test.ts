import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSearchItemsFromPages,
  mergeFriendSearchResults,
  normalizeFriendCode,
  selectNextPageSource,
  updateSearchItemRelation,
} from '../src/hooks/utils/friendSearchPages.ts';
import { getSearchRowAction } from '../src/pages/friends/utils/friendSearchRow.ts';

const item = (
  userId: number,
  relationStatus: 'NONE' | 'REQUESTED' | 'RECEIVED' | 'FRIEND' = 'NONE',
  requestId: number | null = null
) => ({
  userId,
  nickname: `user${userId}`,
  profileImageUrl: null,
  friendCode: `CODE${userId}`,
  relationStatus,
  requestId,
});

test('normalizes a friend code by trimming and upper-casing', () => {
  assert.equal(normalizeFriendCode('  abc91g23 \n'), 'ABC91G23');
  assert.equal(normalizeFriendCode('ABC91G23'), 'ABC91G23');
  assert.equal(normalizeFriendCode('   '), '');
});

test('flattens search pages and drops repeated users', () => {
  const pages = [{ items: [item(1), item(2)] }, { items: [item(2), item(3)] }];

  assert.deepEqual(
    getSearchItemsFromPages(pages).map((i) => i.userId),
    [1, 2, 3]
  );
  assert.deepEqual(getSearchItemsFromPages(undefined), []);
});

test('merge drops FRIEND results', () => {
  const merged = mergeFriendSearchResults([], [item(1, 'FRIEND'), item(2)]);

  assert.deepEqual(
    merged.map((i) => i.userId),
    [2]
  );
});

test('merge drops users already in the friend list, friends win', () => {
  const merged = mergeFriendSearchResults(
    [{ userId: 2 }],
    [item(1), item(2), item(3, 'REQUESTED', 9)]
  );

  assert.deepEqual(
    merged.map((i) => i.userId),
    [1, 3]
  );
});

test('merge keeps the search order and does not mutate its input', () => {
  const search = [item(5), item(3, 'RECEIVED', 1)];
  const merged = mergeFriendSearchResults([], search);

  assert.deepEqual(
    merged.map((i) => i.userId),
    [5, 3]
  );
  assert.equal(search.length, 2);
});

test('updates only the matching user across pages', () => {
  const data = { pages: [{ items: [item(1), item(2)] }, { items: [item(3)] }] };
  const next = updateSearchItemRelation(data, 2, {
    relationStatus: 'REQUESTED',
    requestId: 77,
  });

  assert.equal(next?.pages[0].items[1].relationStatus, 'REQUESTED');
  assert.equal(next?.pages[0].items[1].requestId, 77);
  assert.equal(next?.pages[0].items[0].relationStatus, 'NONE');
  assert.equal(next?.pages[1].items[0].relationStatus, 'NONE');
  assert.equal(data.pages[0].items[1].relationStatus, 'NONE');
});

test('patching to FRIEND clears the request id', () => {
  const data = { pages: [{ items: [item(1, 'RECEIVED', 5)] }] };
  const next = updateSearchItemRelation(data, 1, { relationStatus: 'FRIEND' });

  assert.equal(next?.pages[0].items[0].relationStatus, 'FRIEND');
  assert.equal(next?.pages[0].items[0].requestId, null);
});

test('returns missing data as is', () => {
  assert.equal(
    updateSearchItemRelation(undefined, 1, { relationStatus: 'FRIEND' }),
    undefined
  );
});

test('maps NONE to the primary send button', () => {
  assert.deepEqual(getSearchRowAction('NONE', null), {
    kind: 'send',
    label: '친구 맺기',
    variant: 'primary',
    disabled: false,
  });
});

test('maps REQUESTED to a disabled neutral button', () => {
  assert.deepEqual(getSearchRowAction('REQUESTED', 3), {
    kind: 'requested',
    label: '요청됨',
    variant: 'neutral',
    disabled: true,
  });
});

test('maps RECEIVED to accept, disabled without a request id', () => {
  assert.deepEqual(getSearchRowAction('RECEIVED', 3), {
    kind: 'accept',
    label: '수락',
    variant: 'accept',
    disabled: false,
  });
  assert.equal(getSearchRowAction('RECEIVED', null)?.disabled, true);
  assert.equal(getSearchRowAction('RECEIVED', undefined)?.disabled, true);
});

test('FRIEND has no button', () => {
  assert.equal(getSearchRowAction('FRIEND', null), null);
});

const state = (
  friends: Partial<Parameters<typeof selectNextPageSource>[0]['friends']> = {},
  search: Partial<Parameters<typeof selectNextPageSource>[0]['search']> = {},
  isAnyFetching = false
) => ({
  friends: { isPending: false, isError: false, hasNextPage: false, ...friends },
  search: { isError: false, hasNextPage: false, ...search },
  isAnyFetching,
});

test('loads friends first while they have a next page', () => {
  assert.equal(
    selectNextPageSource(state({ hasNextPage: true }, { hasNextPage: true })),
    'friends'
  );
});

test('loads search once the friend list is exhausted', () => {
  assert.equal(
    selectNextPageSource(state({}, { hasNextPage: true })),
    'search'
  );
});

test('loads nothing when both lists are exhausted', () => {
  assert.equal(selectNextPageSource(state()), null);
});

test('loads nothing while any query is fetching', () => {
  assert.equal(
    selectNextPageSource(state({ hasNextPage: true }, {}, true)),
    null
  );
  assert.equal(
    selectNextPageSource(state({}, { hasNextPage: true }, true)),
    null
  );
});

test('does not move to search while friends are pending or failed', () => {
  assert.equal(
    selectNextPageSource(state({ isPending: true }, { hasNextPage: true })),
    null
  );
  assert.equal(
    selectNextPageSource(
      state({ isError: true, hasNextPage: true }, { hasNextPage: true })
    ),
    null
  );
});

test('stops loading search after a search failure', () => {
  assert.equal(
    selectNextPageSource(state({}, { hasNextPage: true, isError: true })),
    null
  );
});
