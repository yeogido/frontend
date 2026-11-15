import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldPreserveScroll } from '../src/router/preserveScroll.ts';
import {
  getCourseSearchConditions,
  getSelectedSearchCondition,
  toggleSearchConditionParam,
} from '../src/pages/yeogido-course/utils/searchConditions.ts';

test('uses the conditions the server extracted on the first page', () => {
  assert.deepEqual(
    getCourseSearchConditions([
      { extractedKeywords: ['부산', '1박2일', '혼자'] },
      { extractedKeywords: ['다른 페이지'] },
    ]),
    ['부산', '1박2일', '혼자']
  );
});

test('drops blank and repeated conditions', () => {
  assert.deepEqual(
    getCourseSearchConditions([
      { extractedKeywords: [' 데이트 ', '', '데이트', '  ', '코스'] },
    ]),
    ['데이트', '코스']
  );
});

test('hides a condition that is the same as the current search', () => {
  assert.deepEqual(
    getCourseSearchConditions([{ extractedKeywords: ['혼자'] }], ' 혼자 '),
    []
  );
  assert.deepEqual(
    getCourseSearchConditions(
      [{ extractedKeywords: ['부산', '혼자'] }],
      '부산 혼자'
    ),
    ['부산', '혼자']
  );
});

test('returns no conditions before loading or when nothing was extracted', () => {
  assert.deepEqual(getCourseSearchConditions(undefined), []);
  assert.deepEqual(getCourseSearchConditions([]), []);
  assert.deepEqual(getCourseSearchConditions([{}]), []);
  assert.deepEqual(getCourseSearchConditions([{ extractedKeywords: [] }]), []);
});

test('selects a condition only when it is one of the current chips', () => {
  const conditions = ['부산', '비 오는 날', '데이트'];

  assert.equal(getSelectedSearchCondition(conditions, '부산'), '부산');
  assert.equal(getSelectedSearchCondition(conditions, ' 데이트 '), '데이트');
  assert.equal(getSelectedSearchCondition(conditions, '서울'), '');
  assert.equal(getSelectedSearchCondition(conditions, null), '');
  assert.equal(getSelectedSearchCondition([], '부산'), '');
});

test('toggles the selected condition and keeps the other params', () => {
  const searchParams = new URLSearchParams({
    keyword: '부산에서 비오는 날 데이트 코스',
    companion: '연인과',
  });

  const selected = toggleSearchConditionParam(searchParams, '부산');
  assert.equal(selected.get('condition'), '부산');
  assert.equal(selected.get('keyword'), '부산에서 비오는 날 데이트 코스');
  assert.equal(selected.get('companion'), '연인과');
  assert.equal(searchParams.has('condition'), false);

  const switched = toggleSearchConditionParam(selected, '데이트');
  assert.equal(switched.get('condition'), '데이트');

  const cleared = toggleSearchConditionParam(switched, '데이트');
  assert.equal(cleared.has('condition'), false);
  assert.equal(cleared.get('keyword'), '부산에서 비오는 날 데이트 코스');
});

test('preserves scroll only for navigation state that asks for it', () => {
  assert.equal(shouldPreserveScroll({ preserveScroll: true }), true);
  assert.equal(shouldPreserveScroll({ preserveScroll: 'true' }), false);
  assert.equal(shouldPreserveScroll({ from: '/home' }), false);
  assert.equal(shouldPreserveScroll(null), false);
  assert.equal(shouldPreserveScroll(undefined), false);
});
