import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatDistance,
  getDistanceInMeters,
} from '../src/components/kakaomap/utils/kakaoMap.ts';

const seoulCityHall = { latitude: 37.5665, longitude: 126.978 };
const busanCityHall = { latitude: 35.1796, longitude: 129.0756 };

test('서울-부산 직선 거리를 오차 5km 이내로 계산한다', () => {
  const meters = getDistanceInMeters(seoulCityHall, busanCityHall);

  assert.ok(Math.abs(meters - 325_000) < 5_000, `${meters}m`);
});

test('대척점에서도 NaN 없이 지구 둘레의 절반을 돌려준다', () => {
  // a가 1을 넘겨 asin이 NaN이 되던 경우.
  const meters = getDistanceInMeters(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 180 }
  );

  assert.ok(Number.isFinite(meters), `${meters}`);
  assert.ok(Math.abs(meters - 20_015_086) < 1_000, `${meters}m`);
});

test('같은 좌표는 0m', () => {
  assert.equal(getDistanceInMeters(seoulCityHall, seoulCityHall), 0);
});

test('1km 미만은 m, 이상은 km로 표기한다', () => {
  assert.equal(formatDistance(999), '999m');
  assert.equal(formatDistance(1500), '1.5km');
});
