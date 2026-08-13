import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getRecentSearchLocation,
  getSubRegionRecentSearch,
  isKnownRegionPath,
} from '../src/pages/course-region-search/utils/recentSearch.ts';

const 서울_SUB_REGIONS = ['강남구', '마포구', '구로구'];

test('stores the city and sub-region for a sub-region selection', () => {
  assert.equal(getSubRegionRecentSearch('서울', '강남구'), '서울 강남구');
});

test('restores a stored sub-region path when a recent search is selected', () => {
  const city = { id: 'seoul', name: '서울' };

  assert.deepEqual(getRecentSearchLocation('서울 마포구', [city]), {
    city,
    district: '마포구',
  });
});

test('restores an official full region name as its short city and sub-region path', () => {
  const city = { id: 'daejeon', name: '대전' };

  assert.deepEqual(getRecentSearchLocation('대전광역시 동구', [city]), {
    city,
    district: '동구',
  });
});

test('keeps free text as a keyword search instead of a region filter', () => {
  const city = { id: 'seoul', name: '서울' };
  const { district } = getRecentSearchLocation('서울 맛집', [city]) ?? {};

  // 시/도 이름으로 시작하기만 해서는 지역 경로가 아니다. 지역 필터로 바꾸면
  // keyword가 사라져 '맛집'을 하위 지역으로 조회하고 빈 결과가 나온다.
  assert.equal(district, '맛집');
  assert.equal(isKnownRegionPath(district, 서울_SUB_REGIONS), false);
});

test('treats a real sub-region path as a region filter', () => {
  assert.equal(isKnownRegionPath('강남구', 서울_SUB_REGIONS), true);
});

test('treats a city-only search as a region filter', () => {
  assert.equal(isKnownRegionPath(undefined, 서울_SUB_REGIONS), true);
});
