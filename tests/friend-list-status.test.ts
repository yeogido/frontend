import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canLoadMoreAutomatically,
  shouldShowLoadMoreError,
} from '../src/pages/friends/utils/friendListStatus.ts';

// 상태 조합은 react-query 5.101.2의 InfiniteQueryObserver가 실제로 내는 값이다.
const states = {
  firstPageLoaded: {
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
  nextPageFailed: {
    isError: true,
    isFetchNextPageError: true,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
  retryInFlight: {
    isError: true,
    isFetchNextPageError: true,
    isFetchingNextPage: true,
    hasNextPage: true,
  },
  refetchAfterDeleteFailed: {
    isError: true,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
  retrySucceeded: {
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    hasNextPage: true,
  },
};

const showLoadMoreError = (
  state: (typeof states)[keyof typeof states],
  friendCount = 10
) =>
  shouldShowLoadMoreError({
    isFetchNextPageError: state.isFetchNextPageError,
    isFetchingNextPage: state.isFetchingNextPage,
    friendCount,
  });

const loadsAutomatically = (state: (typeof states)[keyof typeof states]) =>
  canLoadMoreAutomatically({
    hasNextPage: state.hasNextPage,
    isPending: false,
    isError: state.isError,
  });

test('shows the load-more error after the next page failed', () => {
  assert.equal(showLoadMoreError(states.nextPageFailed), true);
});

test('hides the load-more error while the retry is in flight', () => {
  assert.equal(showLoadMoreError(states.retryInFlight), false);
});

test('does not show the load-more error when the refetch after a delete failed', () => {
  assert.equal(showLoadMoreError(states.refetchAfterDeleteFailed), false);
});

test('does not show the load-more error before a failure or after a successful retry', () => {
  assert.equal(showLoadMoreError(states.firstPageLoaded), false);
  assert.equal(showLoadMoreError(states.retrySucceeded), false);
});

test('does not show the load-more error when there is no list to load more into', () => {
  assert.equal(showLoadMoreError(states.nextPageFailed, 0), false);
});

test('stops loading automatically while the query is in an error state', () => {
  assert.equal(loadsAutomatically(states.nextPageFailed), false);
  assert.equal(loadsAutomatically(states.retryInFlight), false);
  assert.equal(loadsAutomatically(states.refetchAfterDeleteFailed), false);
});

test('keeps loading automatically while there is no error', () => {
  assert.equal(loadsAutomatically(states.firstPageLoaded), true);
  assert.equal(loadsAutomatically(states.retrySucceeded), true);
});

test('does not load automatically without a next page or during the first load', () => {
  assert.equal(
    canLoadMoreAutomatically({
      hasNextPage: false,
      isPending: false,
      isError: false,
    }),
    false
  );
  assert.equal(
    canLoadMoreAutomatically({
      hasNextPage: undefined,
      isPending: false,
      isError: false,
    }),
    false
  );
  assert.equal(
    canLoadMoreAutomatically({
      hasNextPage: true,
      isPending: true,
      isError: false,
    }),
    false
  );
});
