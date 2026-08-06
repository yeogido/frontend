import assert from 'node:assert/strict';
import test from 'node:test';

import {
  toDistanceLabel,
  toLikedItemInfoLines,
} from '../src/pages/likes/utils/likedItems.ts';

import type { LikedItem } from '../src/pages/likes/types.ts';

const place: LikedItem = {
  id: 57,
  category: 'PLACE',
  title: '이상화 심리상담센터',
  thumbnailUrl: null,
  duration: null,
  startDate: null,
  endDate: null,
  location: '서울특별시 서초구',
  companion: null,
  distance: 10.53,
  region: null,
  detailType: null,
  hashtags: [],
  likedAt: '2026-08-06T12:32:58.198519',
};

test('장소 카드는 현 위치 기준 거리를 소수점 한 자리로 보여준다', () => {
  assert.equal(toDistanceLabel(10.53), '현위치와 10.5KM');
  assert.equal(toDistanceLabel(314), '현위치와 314KM');
});

test('거리가 없으면 거리 줄을 렌더링하지 않는다', () => {
  assert.equal(toDistanceLabel(null), undefined);
  assert.equal(
    toLikedItemInfoLines({ ...place, distance: null }).distanceInfo,
    undefined
  );
});

test('장소 카드 정보 줄에 거리 줄이 포함된다', () => {
  assert.equal(toLikedItemInfoLines(place).distanceInfo, '현위치와 10.5KM');
});

test('코스 카드에는 거리 줄이 없다', () => {
  const course: LikedItem = {
    ...place,
    category: 'COURSE',
    duration: '2박 3일',
    companion: '혼자',
    distance: null,
  };

  assert.equal(toLikedItemInfoLines(course).distanceInfo, undefined);
});
