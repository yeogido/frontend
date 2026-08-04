import assert from 'node:assert/strict';
import test from 'node:test';

import { collectMyReviewIds } from '../src/utils/collectMyReviewIds.ts';
import type { GetMyPostsResponse } from '../src/types/user.type.ts';

const page = (
  reviewIds: number[],
  cursorId: number | null,
  hasNext: boolean
): GetMyPostsResponse => ({
  items: reviewIds.map((reviewId) => ({
    review: {
      reviewId,
      reviewerName: '나',
      reviewerProfileImage: '',
      ageGroup: 'TWENTIES',
      gender: 'FEMALE',
      rating: 5,
      content: '내용',
      createdAt: '2026-07-26T00:00:00',
    },
  })),
  cursorValue: null,
  cursorId,
  hasNext,
});

test('collects review ids across every cursor page', async () => {
  const requested: Array<number | undefined> = [];

  const reviewIds = await collectMyReviewIds(async (cursorId) => {
    requested.push(cursorId);

    return cursorId === undefined
      ? page([3, 2], 2, true)
      : page([1], null, false);
  });

  assert.deepEqual([...reviewIds].sort(), [1, 2, 3]);
  assert.deepEqual(requested, [undefined, 2]);
});

test('stops when hasNext is true but no cursor comes back', async () => {
  let calls = 0;

  const reviewIds = await collectMyReviewIds(async () => {
    calls += 1;
    return page([5], null, true);
  });

  assert.deepEqual([...reviewIds], [5]);
  assert.equal(calls, 1);
});

test('stops when the server keeps returning the same cursor', async () => {
  let calls = 0;

  const reviewIds = await collectMyReviewIds(async () => {
    calls += 1;
    return page([9], 9, true);
  });

  assert.deepEqual([...reviewIds], [9]);
  // 같은 커서가 다시 오면 한 번 더 요청한 뒤 멈춘다. 무한 루프가 되지 않는다.
  assert.equal(calls, 2);
});

test('skips items that carry no review', async () => {
  const reviewIds = await collectMyReviewIds(async () => ({
    items: [{}, ...page([4], null, false).items],
    cursorValue: null,
    cursorId: null,
    hasNext: false,
  }));

  assert.deepEqual([...reviewIds], [4]);
});
