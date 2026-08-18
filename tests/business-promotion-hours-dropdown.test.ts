import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getTodayOperatingDay,
  hasSameOperatingHoursEveryDay,
  type OperatingDay,
} from '../src/utils/operatingHours.ts';

const weekdayHours: readonly OperatingDay[] = [
  { dayOfWeek: 'MONDAY', openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 'WEDNESDAY', openTime: '10:00', closeTime: '20:00' },
];

test('uses the current Seoul weekday as the collapsed business-hours row', () => {
  assert.deepEqual(
    getTodayOperatingDay(weekdayHours, new Date('2026-08-19T03:00:00.000Z')),
    { dayOfWeek: 'WEDNESDAY', openTime: '10:00', closeTime: '20:00' }
  );
});

test('does not offer a dropdown when all seven days share the same hours', () => {
  const identicalDailyHours: OperatingDay[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ].map((dayOfWeek) => ({
    dayOfWeek: dayOfWeek as OperatingDay['dayOfWeek'],
    openTime: '09:00',
    closeTime: '18:00',
  }));

  assert.equal(hasSameOperatingHoursEveryDay(identicalDailyHours), true);
  assert.equal(hasSameOperatingHoursEveryDay(weekdayHours), false);
});

test('enables the dropdown only for local-business detail cards', async () => {
  const [cardSource, infoCardSource, businessSource, festivalSource] =
    await Promise.all([
    readFile(
      new URL('../src/pages/detail/components/DetailPlaceCard.tsx', import.meta.url),
      'utf8'
    ),
    readFile(
      new URL('../src/pages/detail/components/DetailInfoCard.tsx', import.meta.url),
      'utf8'
    ),
    readFile(
      new URL('../src/pages/detail/local-business/index.tsx', import.meta.url),
      'utf8'
    ),
    readFile(
      new URL('../src/pages/detail/festival/index.tsx', import.meta.url),
      'utf8'
    ),
    ]);

  assert.match(cardSource, /IoChevronDown/);
  assert.match(cardSource, /hasSameOperatingHoursEveryDay/);
  assert.match(cardSource, /aria-expanded=\{isHoursOpen\}/);
  assert.equal([...cardSource.matchAll(/tabular-nums/g)].length, 2);
  assert.match(infoCardSource, /IoChevronDown/);
  assert.match(infoCardSource, /hasSameOperatingHoursEveryDay/);
  assert.match(infoCardSource, /aria-expanded=\{isHoursOpen\}/);
  assert.match(infoCardSource, /row\.key === 'hours' \? 'items-start' : 'items-center'/);
  assert.equal(
    [...businessSource.matchAll(/operatingDays=\{businessDetail\.operatingDays\}/g)]
      .length,
    2
  );
  assert.doesNotMatch(festivalSource, /operatingDays=/);
});
