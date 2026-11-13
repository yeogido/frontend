import assert from 'node:assert/strict';
import test from 'node:test';

import { getFriendCoursesFromPages } from '../src/hooks/utils/friendCoursePages.ts';
import {
  getFriendProfileErrorKind,
  getProfileActionAriaLabel,
  getProfileSubtitle,
  parseFriendUserId,
  patchFriendProfileRelation,
} from '../src/pages/friends/utils/friendProfile.ts';
import { getSearchRowAction } from '../src/pages/friends/utils/friendSearchRow.ts';
import {
  DEFAULT_FRIEND_PROFILE_TAB,
  FRIEND_PROFILE_TABS,
} from '../src/pages/friends/profile/friendProfileTabs.ts';

const profile = (
  relationStatus: 'NONE' | 'REQUESTED' | 'RECEIVED' | 'FRIEND' = 'NONE',
  requestId: number | null = null
) => ({
  userId: 7,
  nickname: '김여기도',
  profileImageUrl: null,
  friendCode: 'ABC91G23',
  email: null as string | null,
  relationStatus,
  requestId,
});

test('parses a positive integer id', () => {
  assert.equal(parseFriendUserId('12'), 12);
  assert.equal(parseFriendUserId('1'), 1);
});

test('rejects ids that are not positive integers', () => {
  for (const value of [
    undefined,
    '',
    '0',
    '-3',
    '01',
    '1.5',
    'abc',
    '12a',
    ' 4',
  ]) {
    assert.equal(parseFriendUserId(value), null, String(value));
  }
  assert.equal(parseFriendUserId('99999999999999999999'), null);
});

test('subtitle is the email for a friend', () => {
  assert.equal(
    getProfileSubtitle({
      email: 'yeogido123@gmail.com',
      friendCode: 'ABC91G23',
    }),
    'yeogido123@gmail.com'
  );
});

test('subtitle falls back to the friend code without an email', () => {
  assert.equal(
    getProfileSubtitle({ email: null, friendCode: 'ABC91G23' }),
    'ABC91G23'
  );
  assert.equal(
    getProfileSubtitle({ email: '  ', friendCode: 'ABC91G23' }),
    'ABC91G23'
  );
});

test('the relation button follows the relation status', () => {
  assert.equal(getSearchRowAction('NONE', null)?.label, '친구 맺기');
  assert.equal(getSearchRowAction('REQUESTED', 3)?.disabled, true);
  assert.equal(getSearchRowAction('RECEIVED', 3)?.label, '수락');
  assert.equal(getSearchRowAction('RECEIVED', null)?.disabled, true);
  assert.equal(getSearchRowAction('FRIEND', null), null);
});

test('every accessible name contains the visible label', () => {
  for (const status of ['NONE', 'REQUESTED', 'RECEIVED'] as const) {
    const action = getSearchRowAction(status, 1);

    assert.ok(action);
    assert.ok(
      getProfileActionAriaLabel(action.kind, '김여기도').includes(action.label),
      status
    );
  }
});

test('patching the relation keeps the other fields', () => {
  const next = patchFriendProfileRelation(profile('NONE'), {
    relationStatus: 'REQUESTED',
    requestId: 55,
  });

  assert.equal(next?.relationStatus, 'REQUESTED');
  assert.equal(next?.requestId, 55);
  assert.equal(next?.nickname, '김여기도');
});

test('patching to FRIEND clears the request id and leaves the input alone', () => {
  const before = profile('RECEIVED', 9);
  const next = patchFriendProfileRelation(before, { relationStatus: 'FRIEND' });

  assert.equal(next?.requestId, null);
  assert.equal(before.requestId, 9);
  assert.equal(
    patchFriendProfileRelation(undefined, { relationStatus: 'FRIEND' }),
    undefined
  );
});

test('maps profile error codes to screen behavior', () => {
  assert.equal(
    getFriendProfileErrorKind({
      code: 'COMMON4002',
      message: 'x',
      status: 400,
    }),
    'self'
  );
  assert.equal(
    getFriendProfileErrorKind({ code: 'USER4041', message: 'x', status: 404 }),
    'not-found'
  );
  assert.equal(
    getFriendProfileErrorKind({
      code: 'COMMON5000',
      message: 'x',
      status: 500,
    }),
    'failed'
  );
  assert.equal(getFriendProfileErrorKind(new Error('boom')), 'failed');
});

test('flattens course pages and drops repeated courses', () => {
  const course = (courseId: number) => ({ courseId });

  assert.deepEqual(
    getFriendCoursesFromPages([
      { items: [course(1), course(2)] },
      { items: [course(2), course(3)] },
    ]).map((item) => item.courseId),
    [1, 2, 3]
  );
  assert.deepEqual(getFriendCoursesFromPages(undefined), []);
});

test('tabs follow the design order and open on the courses tab', () => {
  assert.deepEqual(
    FRIEND_PROFILE_TABS.map((tab) => tab.label),
    ['여행 폴더', '여행 지도', '우리동네추천코스']
  );
  assert.equal(DEFAULT_FRIEND_PROFILE_TAB, 'courses');
});
