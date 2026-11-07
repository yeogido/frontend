import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCourseDurationLabel,
  getDurationTypeForTotalDays,
  getTotalDaysForDuration,
  isTotalDaysValidForDuration,
  resolveCourseTotalDays,
  THREE_PLUS_MIN_TOTAL_DAYS,
} from '../src/utils/courseDetail.ts';

test('maps fixed durations to their travel day count', () => {
  assert.equal(getTotalDaysForDuration('DAY_TRIP'), 1);
  assert.equal(getTotalDaysForDuration('ONE_NIGHT'), 2);
  assert.equal(getTotalDaysForDuration('TWO_NIGHT'), 3);
  // 고정 기간은 이미 알고 있는 일수가 있어도 무시하고 기간에 맞춘다.
  assert.equal(getTotalDaysForDuration('ONE_NIGHT', 5), 2);
});

test('keeps the existing day count for THREE_PLUS when it is already valid', () => {
  assert.equal(
    getTotalDaysForDuration('THREE_PLUS'),
    THREE_PLUS_MIN_TOTAL_DAYS
  );
  assert.equal(getTotalDaysForDuration('THREE_PLUS', 6), 6);
  // 3일 이하로는 THREE_PLUS가 될 수 없어 최소값으로 올린다.
  assert.equal(
    getTotalDaysForDuration('THREE_PLUS', 3),
    THREE_PLUS_MIN_TOTAL_DAYS
  );
});

test('derives the duration that matches a changed day count', () => {
  assert.equal(getDurationTypeForTotalDays(1), 'DAY_TRIP');
  assert.equal(getDurationTypeForTotalDays(2), 'ONE_NIGHT');
  assert.equal(getDurationTypeForTotalDays(3), 'TWO_NIGHT');
  assert.equal(getDurationTypeForTotalDays(4), 'THREE_PLUS');
  assert.equal(getDurationTypeForTotalDays(10), 'THREE_PLUS');
});

test('rejects day counts the server would refuse', () => {
  assert.equal(isTotalDaysValidForDuration('TWO_NIGHT', 3), true);
  assert.equal(isTotalDaysValidForDuration('TWO_NIGHT', 2), false);
  assert.equal(isTotalDaysValidForDuration('THREE_PLUS', 4), true);
  assert.equal(isTotalDaysValidForDuration('THREE_PLUS', 3), false);
  assert.equal(isTotalDaysValidForDuration('DAY_TRIP', 1.5), false);
});

test('falls back to the highest day when the response has no totalDays', () => {
  assert.equal(resolveCourseTotalDays({ totalDays: 3, courseItems: [] }), 3);
  assert.equal(
    resolveCourseTotalDays({
      courseItems: [{ day: 1 }, { day: 3 }, { day: 2 }],
    }),
    3
  );
  // 일차 확장 이전 데이터 — day가 아예 없으면 1일차 코스로 본다.
  assert.equal(resolveCourseTotalDays({ courseItems: [{}, {}] }), 1);
  assert.equal(resolveCourseTotalDays({}), 1);
});

test('labels the duration chip from the day count', () => {
  assert.equal(getCourseDurationLabel(1), '당일치기');
  assert.equal(getCourseDurationLabel(2), '1박 2일');
  assert.equal(getCourseDurationLabel(5), '4박 5일');
  // 0이나 음수는 1일 코스로 본다.
  assert.equal(getCourseDurationLabel(0), '당일치기');
});
