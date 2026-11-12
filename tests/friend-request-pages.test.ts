import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canFetchNextRequestPage,
  getRequestsFromPages,
  removeRequestFromData,
  shouldShowSentRequestsCard,
} from '../src/hooks/utils/friendRequestPages.ts';

const page = (...ids: number[]) => ({
  items: ids.map((requestId) => ({ requestId })),
  hasNext: false,
});

test('flattens the pages in order', () => {
  assert.deepEqual(
    getRequestsFromPages([page(1, 2), page(3)]).map((item) => item.requestId),
    [1, 2, 3]
  );
});

test('returns an empty list without pages', () => {
  assert.deepEqual(getRequestsFromPages(undefined), []);
  assert.deepEqual(getRequestsFromPages([]), []);
});

test('keeps only the first of a request that appears on two pages', () => {
  assert.deepEqual(
    getRequestsFromPages([page(1, 2), page(2, 3)]).map(
      (item) => item.requestId
    ),
    [1, 2, 3]
  );
});

test('removes the request from every page and keeps the rest', () => {
  const data = { pages: [page(1, 2), page(3, 2)], pageParams: [{}, {}] };
  const result = removeRequestFromData(data, 2);

  assert.deepEqual(
    result?.pages.map((p) => p.items.map((item) => item.requestId)),
    [[1], [3]]
  );
  assert.deepEqual(result?.pageParams, [{}, {}]);
  assert.equal(result?.pages[0].hasNext, false);
});

test('does not change the original data when removing', () => {
  const data = { pages: [page(1, 2)] };

  removeRequestFromData(data, 1);

  assert.deepEqual(
    data.pages[0].items.map((item) => item.requestId),
    [1, 2]
  );
});

test('leaves the data as is when the request is not in it', () => {
  const result = removeRequestFromData({ pages: [page(1, 2)] }, 9);

  assert.deepEqual(
    result?.pages[0].items.map((item) => item.requestId),
    [1, 2]
  );
});

test('passes undefined data through', () => {
  assert.equal(removeRequestFromData(undefined, 1), undefined);
});

const idle = {
  hasNextPage: true,
  isFetching: false,
  isFetchingNextPage: false,
};

test('fetches the next page only when nothing is being fetched', () => {
  assert.equal(canFetchNextRequestPage(idle), true);
});

test('does not fetch the next page while any query is fetching', () => {
  assert.equal(canFetchNextRequestPage({ ...idle, isFetching: true }), false);
  assert.equal(
    canFetchNextRequestPage({ ...idle, isFetchingNextPage: true }),
    false
  );
});

test('does not fetch the next page when there is none', () => {
  assert.equal(canFetchNextRequestPage({ ...idle, hasNextPage: false }), false);
});

test('shows the sent card for requests, a next page or an error', () => {
  const empty = { requestCount: 0, hasNextPage: false, hasError: false };

  assert.equal(shouldShowSentRequestsCard({ ...empty, requestCount: 2 }), true);
  assert.equal(
    shouldShowSentRequestsCard({ ...empty, hasNextPage: true }),
    true
  );
  assert.equal(shouldShowSentRequestsCard({ ...empty, hasError: true }), true);
});

test('hides the sent card only when it is empty with no next page or error', () => {
  assert.equal(
    shouldShowSentRequestsCard({
      requestCount: 0,
      hasNextPage: false,
      hasError: false,
    }),
    false
  );
});
