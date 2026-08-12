import assert from 'node:assert/strict';
import test from 'node:test';

import {
  sortNeighborhoodsByRelevance,
  toRegionSearchSuggestions,
} from '../src/pages/local-recommendation/region-selection/utils.ts';
import type { Neighborhood } from '../src/pages/local-recommendation/region-selection/types.ts';

test('중복되는 하위 지역 검색 결과에 상위 지역명을 포함하고 선택 ID를 유지한다', () => {
  const regions: Neighborhood[] = [
    { id: 11, name: '동구', parentName: '대전' },
    { id: 26, name: '동구', parentName: '대구' },
  ];

  assert.deepEqual(toRegionSearchSuggestions(regions), [
    { label: '대전 동구', regionId: 11 },
    { label: '대구 동구', regionId: 26 },
  ]);
});

test('지역 검색 결과를 전체 이름과 하위 지역명 일치도 순으로 정렬한다', () => {
  const regions: Neighborhood[] = [
    { id: 1, name: '동대문시장', parentName: '서울' },
    { id: 2, name: '동대문구', parentName: '서울' },
    { id: 3, name: '동대문', parentName: '서울' },
    { id: 4, name: '동대문구', parentName: '경기' },
  ];

  assert.deepEqual(
    sortNeighborhoodsByRelevance(regions, '서울 동대문'),
    [regions[2], regions[1], regions[0], regions[3]],
  );
});
