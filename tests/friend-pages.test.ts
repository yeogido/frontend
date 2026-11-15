import assert from 'node:assert/strict';
import test from 'node:test';

import { getFriendsFromPages } from '../src/hooks/utils/friendPages.ts';

import type {
  FriendSummary,
  GetFriendsResponse,
} from '../src/types/friend.type.ts';

const createFriend = (userId: number): FriendSummary => ({
  userId,
  nickname: `친구${userId}`,
  profileImageUrl: null,
  friendCode: `CODE${userId}`,
});

const createPage = (
  userIds: number[],
  hasNext: boolean
): GetFriendsResponse => ({
  items: userIds.map(createFriend),
  cursorValue: hasNext ? `친구${userIds[userIds.length - 1]}` : null,
  cursorId: hasNext ? userIds[userIds.length - 1] : null,
  hasNext,
});

test('returns an empty list before any page has loaded', () => {
  assert.deepEqual(getFriendsFromPages(undefined), []);
  assert.deepEqual(getFriendsFromPages([]), []);
});

test('joins the pages into one list in the order they were loaded', () => {
  const friends = getFriendsFromPages([
    createPage([1, 2], true),
    createPage([3], false),
  ]);

  assert.deepEqual(
    friends.map((friend) => friend.userId),
    [1, 2, 3]
  );
});

test('keeps an empty page from adding friends', () => {
  const friends = getFriendsFromPages([createPage([], false)]);

  assert.deepEqual(friends, []);
});
