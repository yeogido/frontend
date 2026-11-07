import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCourseDayLabel,
  getCourseTransportInfo,
  groupCourseStopsByDay,
} from '../src/utils/courseDetail.ts';

test('shows only populated days in day and visit order without changing input', () => {
  const stops = [
    { id: 4, day: 3, order: 2 },
    { id: 2, day: 1, order: 2 },
    { id: 3, day: 3, order: 1 },
    { id: 1, day: 1, order: 1 },
  ];
  const original = structuredClone(stops);
  const days = groupCourseStopsByDay(stops);
  assert.deepEqual(
    days.map((group) => group.day),
    [1, 3]
  );
  assert.deepEqual(
    days.map((group) => group.stops.map((stop) => stop.id)),
    [
      [1, 2],
      [3, 4],
    ]
  );
  assert.deepEqual(stops, original);
  assert.equal(getCourseDayLabel(days[1].day), '3일차');
});

test('handles empty, legacy and invalid day data', () => {
  assert.deepEqual(groupCourseStopsByDay([]), []);
  const legacy = [
    { order: 1 },
    { day: 0, order: 2 },
    { day: -2, order: 3 },
    { day: 1.5, order: 4 },
  ];
  const days = groupCourseStopsByDay(legacy);
  assert.equal(days.length, 1);
  assert.equal(days[0].day, 1);
  assert.equal(days[0].stops.length, 4);
  assert.equal(getCourseDayLabel(1), '1일차');
  assert.equal(getCourseDayLabel(2), '2일차');
  assert.equal(getCourseDayLabel(11), '11일차');
});

test('keeps walking alongside short car times, including exactly three minutes', () => {
  for (const carMinutes of [0, 2, 3, 4]) {
    const info = getCourseTransportInfo([
      { transportMode: 'CAR', durationMinutes: carMinutes },
      { transportMode: 'WALK', durationMinutes: 8 },
    ]);
    assert.equal(
      info.map((time) => `${time.label} ${time.durationMinutes}분`).join(' · '),
      `도보 8분 · 차량 ${carMinutes}분`
    );
  }
});

test('excludes walking at thirty minutes and above while preserving other modes', () => {
  for (const walkMinutes of [29, 30, 31]) {
    const info = getCourseTransportInfo([
      { transportMode: 'WALK', durationMinutes: walkMinutes },
      { transportMode: 'CAR', durationMinutes: 3 },
      { transportMode: 'PUBLIC', durationMinutes: 12 },
    ]);
    assert.deepEqual(
      info.map((time) => time.transportMode),
      walkMinutes < 30 ? ['WALK', 'CAR', 'PUBLIC'] : ['CAR', 'PUBLIC']
    );
  }
});

test('does not invent missing durations or render invalid numbers', () => {
  assert.deepEqual(getCourseTransportInfo([]), []);
  assert.deepEqual(
    getCourseTransportInfo([
      { transportMode: 'WALK', durationMinutes: 30 },
      { transportMode: 'CAR', durationMinutes: NaN },
      { transportMode: 'PUBLIC', durationMinutes: -1 },
    ]),
    []
  );
  assert.deepEqual(
    getCourseTransportInfo([{ transportMode: 'WALK', durationMinutes: 8 }]).map(
      (time) => time.label
    ),
    ['도보']
  );
});
