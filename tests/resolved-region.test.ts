import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findRegionSearchMatch,
  getExplicitRegionId,
  getRegionSearchKeyword,
  toShortRegionPath,
} from '../src/utils/regionSearch.ts';

// GET /regions/search?keyword=중구 의 실제 응답 순서다. 서울이 먼저 온다.
const 중구_SEARCH_RESULTS = [
  { regionId: 18, name: '중구', fullName: '서울특별시 중구' },
  { regionId: 34, name: '중구', fullName: '부산광역시 중구' },
  { regionId: 52, name: '중구', fullName: '대구광역시 중구' },
  { regionId: 77, name: '중구', fullName: '대전광역시 중구' },
  { regionId: 272, name: '중구', fullName: '울산광역시 중구' },
];

test('matches a nested region by the final name in a shortened region path', () => {
  assert.deepEqual(
    findRegionSearchMatch('서울 마포구', [
      { regionId: 1, name: '마포구', fullName: '서울특별시 마포구' },
    ]),
    { regionId: 1, name: '마포구', fullName: '서울특별시 마포구' }
  );
});

test('uses the final region name as a search keyword for a nested path', () => {
  assert.equal(getRegionSearchKeyword('서울 마포구'), '마포구');
});

test('picks the sub-region belonging to the province in the region path', () => {
  assert.equal(findRegionSearchMatch('부산 중구', 중구_SEARCH_RESULTS)?.regionId, 34);
  assert.equal(findRegionSearchMatch('대전 중구', 중구_SEARCH_RESULTS)?.regionId, 77);
  assert.equal(findRegionSearchMatch('서울 중구', 중구_SEARCH_RESULTS)?.regionId, 18);
});

test('normalizes official province names when comparing with a short path', () => {
  const results = [
    { regionId: 100, name: '고성군', fullName: '강원특별자치도 고성군' },
    { regionId: 200, name: '고성군', fullName: '경상남도 고성군' },
  ];

  assert.equal(findRegionSearchMatch('강원 고성군', results)?.regionId, 100);
  assert.equal(findRegionSearchMatch('경남 고성군', results)?.regionId, 200);
});

test('matches a province whose name is a prefix of its own sub-regions', () => {
  // GET /regions/search?keyword=부산 은 이름 LIKE 검색이라 부산진구도 함께 온다.
  assert.equal(
    findRegionSearchMatch('부산', [
      { regionId: 27, name: '부산', fullName: '부산광역시' },
      { regionId: 41, name: '부산진구', fullName: '부산광역시 부산진구' },
    ])?.regionId,
    27
  );
});

test('matches a sub-region nested two levels under its province', () => {
  assert.equal(
    findRegionSearchMatch('제주 구좌읍', [
      { regionId: 300, name: '구좌읍', fullName: '제주특별자치도 제주시 구좌읍' },
    ])?.regionId,
    300
  );
});

test('normalizes a suggested full name into the short region path', () => {
  // 제안 목록은 fullName을 보여주지만 최근 검색어·URL은 짧은 표기를 쓴다.
  assert.equal(toShortRegionPath('대전광역시 동구'), '대전 동구');
  assert.equal(toShortRegionPath('서울특별시'), '서울');
  assert.equal(toShortRegionPath('강원특별자치도 고성군'), '강원 고성군');
});

test('leaves free text untouched when normalizing a region path', () => {
  assert.equal(toShortRegionPath('서울 맛집'), '서울 맛집');
  assert.equal(toShortRegionPath('  맛집  '), '맛집');
  assert.equal(toShortRegionPath(''), '');
});

test('gives up instead of guessing when the name stays ambiguous', () => {
  assert.equal(findRegionSearchMatch('중구', 중구_SEARCH_RESULTS), undefined);
  assert.equal(findRegionSearchMatch('경기 중구', 중구_SEARCH_RESULTS), undefined);
});

test('accepts only a positive integer as an explicit region id', () => {
  assert.equal(getExplicitRegionId('24'), 24);
  assert.equal(getExplicitRegionId(''), undefined);
  assert.equal(getExplicitRegionId('0'), undefined);
  assert.equal(getExplicitRegionId('-1'), undefined);
  assert.equal(getExplicitRegionId('24.5'), undefined);
  assert.equal(getExplicitRegionId('서울'), undefined);
});
