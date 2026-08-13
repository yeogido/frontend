import assert from 'node:assert/strict';
import test from 'node:test';

import { getInitialTravelDateRange } from '../src/pages/travel-record/date-selection/utils/calendar.ts';

test('defaults a new travel date selection to today', () => {
  const today = new Date(2026, 6, 31, 15, 30);

  const range = getInitialTravelDateRange(null, today);

  assert.deepEqual(range, {
    startDate: new Date(2026, 6, 31),
    endDate: new Date(2026, 6, 31),
  });
});
