import assert from 'node:assert/strict';
import test from 'node:test';

import { getCourseSearchConditions } from '../src/pages/yeogido-course/utils/searchConditions.ts';

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
