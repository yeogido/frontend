import assert from 'node:assert/strict';
import test from 'node:test';

import {
  countFittingItems,
  ITEM_FIT_EPSILON,
  selectFittingItemsWithRequiredIndex,
} from '../src/utils/visibleItemCount.ts';

test('counts nothing when there are no items', () => {
  assert.equal(countFittingItems([], 4, 100), 0);
});

test('counts every item that fits with gaps between them', () => {
  // 30 + 4 + 30 + 4 + 30 = 98
  assert.equal(countFittingItems([30, 30, 30], 4, 98), 3);
});

test('stops at the first item that would overflow', () => {
  // 세 번째를 더하면 98이라 96을 넘는다. 잘린 항목은 아예 그리지 않는다.
  assert.equal(countFittingItems([30, 30, 30], 4, 96), 2);
});

test('counts nothing when even the first item overflows', () => {
  assert.equal(countFittingItems([120, 10], 4, 100), 0);
});

test('does not add a gap before the first item', () => {
  // gap을 첫 항목 앞에도 더하면 100 < 104라 0이 된다.
  assert.equal(countFittingItems([100], 4, 100), 1);
});

test('tolerates sub-pixel overflow within the epsilon', () => {
  // 카드가 scale()로 축소돼 폭이 정수로 안 떨어질 때 딱 맞는 항목이
  // 사라지지 않아야 한다.
  assert.equal(countFittingItems([100 + ITEM_FIT_EPSILON], 0, 100), 1);
  assert.equal(countFittingItems([100 + ITEM_FIT_EPSILON * 3], 0, 100), 0);
});

test('stops at an unmeasured item but keeps the ones before it', () => {
  // 태그 칩은 이미지라 로드 전 폭이 0이다. 하나가 안 재진다고 앞의 항목까지
  // 통째로 숨기지 않는다.
  assert.equal(countFittingItems([30, 0, 30], 4, 200), 1);
  assert.equal(countFittingItems([0, 30], 4, 200), 0);
});

test('keeps a required item visible when the metadata row is too narrow', () => {
  assert.deepEqual(
    selectFittingItemsWithRequiredIndex([30, 30, 30], 4, 68, 2),
    [0, 2]
  );
});

test('keeps multiple required metadata items visible when the row is too narrow', () => {
  assert.deepEqual(
    selectFittingItemsWithRequiredIndex([30, 30, 30], 4, 68, [1, 2]),
    [1, 2]
  );
});

test('keeps every metadata item visible when all items are required', () => {
  assert.deepEqual(
    selectFittingItemsWithRequiredIndex([30, 30, 30], 4, 68, [0, 1, 2]),
    [0, 1, 2]
  );
});
