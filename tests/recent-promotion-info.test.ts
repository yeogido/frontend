import assert from 'node:assert/strict';
import test from 'node:test';

import { toRecentPromotionInfo } from '../src/pages/recent-viewed/utils.ts';

// 2026-11-23은 월요일(KST).
const MONDAY_NOON = new Date('2026-11-23T12:00:00+09:00');
const SEOUL = { latitude: 37.5665, longitude: 126.978 };
const BUSAN = { latitude: 35.1796, longitude: 129.0756 };

const monday = {
  dayOfWeek: 'MONDAY' as const,
  openTime: '10:00',
  closeTime: '00:00',
};

test("shows today's opening hours", () => {
  const info = toRecentPromotionInfo(
    { operatingDays: [monday] },
    null,
    MONDAY_NOON
  );

  assert.equal(info.hoursLabel, '10:00 - 24:00');
});

test('says closed when the registered hours skip today', () => {
  const info = toRecentPromotionInfo(
    { operatingDays: [{ ...monday, dayOfWeek: 'TUESDAY' }] },
    null,
    MONDAY_NOON
  );

  assert.equal(info.hoursLabel, '휴무');
});

test('says hours are unknown for records saved without them', () => {
  assert.equal(
    toRecentPromotionInfo({}, null, MONDAY_NOON).hoursLabel,
    '영업시간 정보 없음'
  );
});

test('measures the distance from the user to the place', () => {
  const { distanceKm } = toRecentPromotionInfo(BUSAN, SEOUL, MONDAY_NOON);

  assert.ok(distanceKm !== null && distanceKm > 320 && distanceKm < 330);
});

test('has no distance without both locations', () => {
  assert.equal(
    toRecentPromotionInfo(BUSAN, null, MONDAY_NOON).distanceKm,
    null
  );
  assert.equal(toRecentPromotionInfo({}, SEOUL, MONDAY_NOON).distanceKm, null);
});
