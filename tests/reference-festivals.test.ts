import assert from 'node:assert/strict';
import test from 'node:test';

import { referenceFestivalRecords } from '../src/pages/local-recommendation/event-selection/constants/referenceFestivals.ts';

test('동일한 참고 행사를 하나의 canonical ID로 제공한다', () => {
  assert.deepEqual(referenceFestivalRecords, [
    {
      id: 'gwangalli-beach-01',
      tag: '광안리해수욕장',
      title: '광안리해수욕장',
      address: '부산 수영구 광안해변로 219',
    },
  ]);
});
