import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findRegionSearchMatch,
  getRegionSearchKeyword,
} from '../src/utils/regionSearch.ts';

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
