import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyBoundaryResistance,
  getSnapHeights,
  resolveSnapIndex,
} from '../src/pages/local-recommendation/event-selection/bottomSheet.ts';
import {
  filterFestivalApiItems,
  normalizeFestivalTag,
} from '../src/pages/local-recommendation/event-selection/festivalSearch.ts';

const snapHeights = [253.2, 506.4, 759.6];

test('844px viewport에서 30%, 60%, 90% 높이를 계산한다', () => {
  assert.deepEqual(getSnapHeights(844), snapHeights);
});

test('느린 드래그는 가장 가까운 스냅을 선택한다', () => {
  assert.equal(
    resolveSnapIndex({
      height: 520,
      velocityY: 0.1,
      currentIndex: 1,
      snapHeights,
    }),
    1
  );
});

test('빠른 위쪽 플릭은 다음 스냅으로 확장한다', () => {
  assert.equal(
    resolveSnapIndex({
      height: 420,
      velocityY: -0.8,
      currentIndex: 0,
      snapHeights,
    }),
    1
  );
});

test('빠른 아래쪽 플릭은 이전 스냅으로 축소한다', () => {
  assert.equal(
    resolveSnapIndex({
      height: 620,
      velocityY: 0.8,
      currentIndex: 2,
      snapHeights,
    }),
    1
  );
});

test('첫 스냅 아래와 마지막 스냅 위에서는 드래그 저항을 적용한다', () => {
  assert.equal(applyBoundaryResistance(200, 250, 750), 237.5);
  assert.equal(applyBoundaryResistance(800, 250, 750), 762.5);
  assert.equal(applyBoundaryResistance(500, 250, 750), 500);
});

test('행사 태그를 공백과 대소문자 차이 없이 정규화한다', () => {
  assert.equal(normalizeFestivalTag('  BUSAN Festival  '), 'busan festival');
});

test('검색어가 태그, 제목 또는 주소에 포함된 행사만 반환한다', () => {
  const festivals = [
    {
      id: '1',
      tag: '광안리해수욕장',
      title: '광안리해수욕장',
      address: '부산 수영구 광안해변로 219',
    },
    {
      id: '2',
      tag: '불꽃축제',
      title: '부산불꽃축제',
      address: '부산 광안리',
    },
  ];

  assert.deepEqual(
    filterFestivalApiItems(festivals, '불꽃').map((festival) => festival.id),
    ['2']
  );
  assert.deepEqual(
    filterFestivalApiItems(festivals, '수영구').map((festival) => festival.id),
    ['1']
  );
});
