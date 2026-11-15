import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createFestivalCalendarWeeks,
  getNextFestivalDateRange,
  isDateInFestivalRange,
  parseFestivalDateRange,
  resolveFestivalCalendarMonth,
  shiftFestivalCalendarMonth,
  toFestivalDateQuery,
} from '../src/pages/festival/utils/festivalCalendar.ts';
import { getFestivalListQuery } from '../src/pages/festival/utils/festivalListQuery.ts';

test('first tap sets only the start date', () => {
  assert.deepEqual(getNextFestivalDateRange(null, '2026-11-04'), {
    startDate: '2026-11-04',
    endDate: null,
  });
});

test('second tap sets the end date', () => {
  assert.deepEqual(
    getNextFestivalDateRange(
      { startDate: '2026-11-04', endDate: null },
      '2026-11-10'
    ),
    { startDate: '2026-11-04', endDate: '2026-11-10' }
  );
});

test('second tap before the start date swaps the two dates', () => {
  assert.deepEqual(
    getNextFestivalDateRange(
      { startDate: '2026-11-10', endDate: null },
      '2026-11-04'
    ),
    { startDate: '2026-11-04', endDate: '2026-11-10' }
  );
});

test('tapping the start date again makes a one-day range', () => {
  assert.deepEqual(
    getNextFestivalDateRange(
      { startDate: '2026-11-04', endDate: null },
      '2026-11-04'
    ),
    { startDate: '2026-11-04', endDate: '2026-11-04' }
  );
});

test('third tap starts a new range', () => {
  assert.deepEqual(
    getNextFestivalDateRange(
      { startDate: '2026-11-04', endDate: '2026-11-10' },
      '2026-11-20'
    ),
    { startDate: '2026-11-20', endDate: null }
  );
});

test('a start-only range queries that single day', () => {
  assert.deepEqual(
    toFestivalDateQuery({ startDate: '2026-11-04', endDate: null }),
    { startDate: '2026-11-04', endDate: '2026-11-04' }
  );
  assert.deepEqual(toFestivalDateQuery(null), {});
});

test('range parsing ignores invalid URL values and fixes reversed dates', () => {
  assert.equal(parseFestivalDateRange(null, '2026-11-10'), null);
  assert.equal(parseFestivalDateRange('2026-02-30', null), null);
  assert.deepEqual(parseFestivalDateRange('2026-11-04', 'oops'), {
    startDate: '2026-11-04',
    endDate: null,
  });
  assert.deepEqual(parseFestivalDateRange('2026-11-10', '2026-11-04'), {
    startDate: '2026-11-04',
    endDate: '2026-11-10',
  });
});

test('dates between start and end are in the range, both ends included', () => {
  const range = { startDate: '2026-10-30', endDate: '2026-11-02' };

  assert.equal(isDateInFestivalRange('2026-10-30', range), true);
  assert.equal(isDateInFestivalRange('2026-10-31', range), true);
  assert.equal(isDateInFestivalRange('2026-11-02', range), true);
  assert.equal(isDateInFestivalRange('2026-11-03', range), false);
  assert.equal(
    isDateInFestivalRange('2026-10-30', {
      startDate: '2026-10-30',
      endDate: null,
    }),
    true
  );
});

test('calendar opens on the URL month, then the start month, then today', () => {
  const today = new Date(2026, 10, 9);

  assert.deepEqual(resolveFestivalCalendarMonth('2026-03', null, today), {
    year: 2026,
    monthIndex: 2,
  });
  assert.deepEqual(
    resolveFestivalCalendarMonth(
      null,
      { startDate: '2025-12-24', endDate: null },
      today
    ),
    { year: 2025, monthIndex: 11 }
  );
  assert.deepEqual(resolveFestivalCalendarMonth('2026-13', null, today), {
    year: 2026,
    monthIndex: 10,
  });
});

test('month navigation crosses year boundaries', () => {
  assert.deepEqual(
    shiftFestivalCalendarMonth({ year: 2026, monthIndex: 0 }, -1),
    { year: 2025, monthIndex: 11 }
  );
  assert.deepEqual(
    shiftFestivalCalendarMonth({ year: 2026, monthIndex: 11 }, 1),
    { year: 2027, monthIndex: 0 }
  );
});

test('October 2026 fills five weeks starting from Sunday Sep 27', () => {
  const weeks = createFestivalCalendarWeeks({ year: 2026, monthIndex: 9 });

  assert.equal(weeks.length, 5);
  assert.deepEqual(weeks[0][0], {
    date: '2026-09-27',
    day: 27,
    weekday: 0,
    isCurrentMonth: false,
  });
  assert.equal(weeks[0][4].date, '2026-10-01');
  assert.equal(weeks[4][6].date, '2026-10-31');
});

test('a month needing six weeks gets six rows', () => {
  // 2026년 8월은 토요일에 시작해 31일까지라 6주가 필요하다.
  assert.equal(
    createFestivalCalendarWeeks({ year: 2026, monthIndex: 7 }).length,
    6
  );
});

test('grid view keeps showing only ongoing festivals', () => {
  assert.deepEqual(getFestivalListQuery('grid', null), {
    statuses: ['ONGOING'],
  });
  assert.deepEqual(
    getFestivalListQuery('grid', { startDate: '2026-11-04', endDate: null }),
    { statuses: ['ONGOING'] }
  );
});

test('calendar view without a range leaves statuses to the server default', () => {
  // 서버 기본값(예정·진행 중)을 쓴다. 상태 배열을 직접 보내면
  // statuses[] 형식 때문에 서버가 하나만 읽는다.
  assert.deepEqual(getFestivalListQuery('calendar', null), {});
});

test('calendar view with a range sends the dates and no status filter', () => {
  assert.deepEqual(
    getFestivalListQuery('calendar', {
      startDate: '2026-11-04',
      endDate: '2026-11-10',
    }),
    { startDate: '2026-11-04', endDate: '2026-11-10' }
  );
});
