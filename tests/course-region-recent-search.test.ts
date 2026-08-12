import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getRecentSearchLocation,
  getSubRegionRecentSearch,
} from '../src/pages/course-region-search/utils/recentSearch.ts';

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
