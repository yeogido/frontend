import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllRegionRecentSearch,
  getRecentSearchLocation,
  getSubRegionRecentSearch,
} from '../src/pages/course-region-search/utils/recentSearch.ts';

test('stores only the current parent region for an all-region selection', () => {
  assert.equal(getAllRegionRecentSearch('서울', undefined), '서울');
  assert.equal(getAllRegionRecentSearch('서울', '강남구'), '강남구');
});

test('stores the full region path for a leaf sub-region selection', () => {
  assert.equal(
    getSubRegionRecentSearch('서울', ['강남구'], '역삼동'),
    '서울 강남구 역삼동'
  );
});

test('restores a stored sub-region path when a recent search is selected', () => {
  const city = { id: 'seoul', name: '서울' };

  assert.deepEqual(getRecentSearchLocation('서울 마포구', [city]), {
    city,
    district: '마포구',
  });
});
