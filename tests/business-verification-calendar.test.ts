import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCalendarDays,
  formatDateValue,
  isFutureDate,
  isFutureMonth,
  parseDateValue,
} from '../src/components/common/DatePicker/calendar.ts';

test('creates a calendar grid with the month dates in their weekday positions', () => {
  const calendarDays = createCalendarDays(2026, 7);

  assert.equal(calendarDays.length, 42);
  assert.equal(calendarDays[6], 1);
  assert.equal(calendarDays[36], 31);
  assert.equal(calendarDays[37], null);
});

test('formats and parses date values without timezone conversion', () => {
  const value = formatDateValue(new Date(2026, 7, 6));

  assert.equal(value, '2026-08-06');
  assert.deepEqual(parseDateValue(value), new Date(2026, 7, 6));
  assert.equal(parseDateValue('invalid'), null);
});

test('uses real leap-year and month-end dates', () => {
  const leapYearFebruary = createCalendarDays(2024, 1);

  assert.equal(leapYearFebruary[4], 1);
  assert.equal(leapYearFebruary[32], 29);
  assert.equal(leapYearFebruary[33], null);
  assert.deepEqual(parseDateValue('2024-02-29'), new Date(2024, 1, 29));
  assert.equal(parseDateValue('2025-02-29'), null);
  assert.equal(parseDateValue('2026-04-31'), null);
});

test('disables dates and months after today', () => {
  const today = new Date(2026, 7, 6);

  assert.equal(isFutureDate(new Date(2026, 7, 6), today), false);
  assert.equal(isFutureDate(new Date(2026, 7, 7), today), true);
  assert.equal(isFutureMonth(2026, 7, today), false);
  assert.equal(isFutureMonth(2026, 8, today), true);
  assert.equal(isFutureMonth(2027, 0, today), true);
});
