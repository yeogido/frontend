import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDetailFilterOptions,
  mapLikedItemResponse,
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
  externalPlaceId: null,
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

test('행사/장소는 서버가 분류를 안 주므로 2번째 필터에 "전체"만 남는다', () => {
  assert.deepEqual(getDetailFilterOptions('행사', [place]), ['전체']);
  assert.deepEqual(getDetailFilterOptions('장소', [place]), ['전체']);
});

test('코스는 좋아요한 코스의 지역으로 2번째 필터를 채운다', () => {
  const course: LikedItem = { ...place, category: 'COURSE', region: '부산' };

  assert.deepEqual(getDetailFilterOptions('코스', [course]), ['전체', '부산']);
});

test('코스 카테고리 응답의 transportType과 companionType을 한글 라벨로 매핑한다', () => {
  const mapped = mapLikedItemResponse({
    id: 1,
    category: 'COURSE',
    title: '서울 명소 투어',
    thumbnailImage: null,
    duration: 'DAY_TRIP',
    startDate: null,
    endDate: null,
    location: '서울특별시',
    transportType: 'CAR',
    companionType: 'FRIEND',
    distance: null,
    hashtags: ['힐링'],
    likedAt: '2026-08-06T00:00:00Z',
  });

  assert.equal(mapped.location, '자동차');
  assert.equal(mapped.companion, '친구와');
  assert.equal(mapped.duration, '당일치기');

  const infoLines = toLikedItemInfoLines(mapped);
  assert.equal(infoLines.secondInfo, '자동차');
  assert.equal(infoLines.thirdInfo, '친구와');
});
