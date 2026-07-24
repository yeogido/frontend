import assert from 'node:assert/strict';
import test from 'node:test';

import { filterFestivalApiItems } from '../src/pages/local-recommendation/event-selection/festivalSearch.ts';

test('검색어가 행사 필드 경계를 걸치면 일치하지 않는다', () => {
  const festivals = [
    {
      id: '1',
      tag: '해운대',
      title: '빛축제',
      address: '부산 해운대구',
    },
  ];

  assert.deepEqual(filterFestivalApiItems(festivals, '해운대 빛'), []);
});
