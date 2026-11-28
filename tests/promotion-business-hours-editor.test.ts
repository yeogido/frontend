import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyAllDay,
  applyDayTimeChange,
  applyDaysChange,
  applySharedTime,
  getHoursEditorMode,
  getSharedEntry,
  getSharedErrorMessage,
  isAllDayForSelectedDays,
  lockHoursEditorMode,
} from '../src/pages/business-promotion-registration/promotion-info/businessHoursEditor.ts';

const nine = { openTime: '09:00', closeTime: '18:00' };
const night = { openTime: '18:00', closeTime: '02:00' };

test('days with the same time share one line', () => {
  assert.equal(
    getHoursEditorMode(['MONDAY', 'TUESDAY'], { MONDAY: nine, TUESDAY: nine }),
    'single'
  );
});

test('days with different times keep the per-day list', () => {
  assert.equal(
    getHoursEditorMode(['MONDAY', 'TUESDAY'], { MONDAY: nine, TUESDAY: night }),
    'perDay'
  );
  // 한쪽만 입력한 경우도 서로 다르다.
  assert.equal(
    getHoursEditorMode(['MONDAY', 'TUESDAY'], { MONDAY: nine, TUESDAY: {} }),
    'perDay'
  );
});

test('no day, one day and all-empty days show one line', () => {
  assert.equal(getHoursEditorMode([], {}), 'single');
  assert.equal(getHoursEditorMode(['MONDAY'], { MONDAY: nine }), 'single');
  assert.equal(getHoursEditorMode(['MONDAY', 'TUESDAY'], {}), 'single');
});

test('the server and legacy 24-hour values count as the same time', () => {
  assert.equal(
    getHoursEditorMode(['MONDAY', 'TUESDAY'], {
      MONDAY: { openTime: '00:00', closeTime: '00:00' },
      TUESDAY: { openTime: '00:00', closeTime: '23:59' },
    }),
    'single'
  );
});

test('the shared entry is the first selected day, empty without days', () => {
  assert.deepEqual(
    getSharedEntry(['TUESDAY', 'MONDAY'], { TUESDAY: night, MONDAY: nine }),
    night
  );
  assert.deepEqual(getSharedEntry([], { MONDAY: nine }), {});
  assert.deepEqual(getSharedEntry(['MONDAY'], {}), {});
});

test('a time picked on the line is written to every selected day', () => {
  const next = applySharedTime(
    ['MONDAY', 'TUESDAY'],
    { MONDAY: nine, TUESDAY: nine, WEDNESDAY: night },
    { closeTime: '20:00' }
  );

  assert.deepEqual(next.MONDAY, { openTime: '09:00', closeTime: '20:00' });
  assert.deepEqual(next.TUESDAY, { openTime: '09:00', closeTime: '20:00' });
  // 선택하지 않은 요일은 건드리지 않는다.
  assert.deepEqual(next.WEDNESDAY, night);
});

test('a day added later gets the current line value', () => {
  const next = applyDaysChange(
    'single',
    ['MONDAY', 'TUESDAY'],
    ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
    { MONDAY: nine, TUESDAY: nine, WEDNESDAY: night }
  );

  assert.deepEqual(next.WEDNESDAY, nine);
});

test('adding the first day to an empty line clears a stale value', () => {
  const next = applyDaysChange('single', [], ['MONDAY'], { MONDAY: nine });

  assert.deepEqual(next.MONDAY, {});
});

test('removing a day or keeping the days changes nothing', () => {
  const times = { MONDAY: nine, TUESDAY: nine };

  assert.equal(
    applyDaysChange('single', ['MONDAY', 'TUESDAY'], ['MONDAY'], times),
    times
  );
  assert.equal(
    applyDaysChange(
      'single',
      ['MONDAY', 'TUESDAY'],
      ['MONDAY', 'TUESDAY'],
      times
    ),
    times
  );
});

test('a day added in per-day mode keeps its own value', () => {
  const times = {
    MONDAY: nine,
    TUESDAY: night,
    WEDNESDAY: { openTime: '10:00', closeTime: '19:00' },
  };
  const next = applyDaysChange(
    'perDay',
    ['MONDAY', 'TUESDAY'],
    ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
    times
  );

  assert.equal(next, times);
});

test('all day needs selected days that are all 24-hour', () => {
  const allDay = { openTime: '00:00', closeTime: '00:00' };

  assert.equal(isAllDayForSelectedDays([], {}), false);
  assert.equal(isAllDayForSelectedDays(['MONDAY'], { MONDAY: allDay }), true);
  assert.equal(
    isAllDayForSelectedDays(['MONDAY', 'TUESDAY'], {
      MONDAY: allDay,
      TUESDAY: nine,
    }),
    false
  );
});

test('checking 24 hours writes 00:00 to 00:00 to every selected day', () => {
  const next = applyAllDay(
    ['MONDAY', 'TUESDAY'],
    { MONDAY: nine, TUESDAY: nine, FRIDAY: night },
    true
  );

  assert.deepEqual(next.MONDAY, { openTime: '00:00', closeTime: '00:00' });
  assert.deepEqual(next.TUESDAY, { openTime: '00:00', closeTime: '00:00' });
  assert.deepEqual(next.FRIDAY, night);
});

test('unchecking 24 hours restores the earlier value or clears', () => {
  const allDay = { openTime: '00:00', closeTime: '00:00' };
  const times = { MONDAY: allDay, TUESDAY: allDay };

  assert.deepEqual(
    applyAllDay(['MONDAY', 'TUESDAY'], times, false, nine).MONDAY,
    nine
  );
  assert.deepEqual(
    applyAllDay(['MONDAY', 'TUESDAY'], times, false).TUESDAY,
    {}
  );
  // 켜기 전 값이 24시간이면 다시 24시간이 되지 않게 비운다.
  assert.deepEqual(applyAllDay(['MONDAY'], times, false, allDay).MONDAY, {});
});

test('the line shows the first error of the selected days', () => {
  assert.equal(
    getSharedErrorMessage(['MONDAY', 'TUESDAY'], {
      TUESDAY: '종료 시간을 선택해 주세요.',
    }),
    '종료 시간을 선택해 주세요.'
  );
  assert.equal(
    getSharedErrorMessage(['MONDAY'], { TUESDAY: '오류' }),
    undefined
  );
});

test('the mode stays undecided until a day is selected', () => {
  assert.equal(lockHoursEditorMode(undefined, [], {}), undefined);
  // 수정 모드에서 기존 값이 늦게 들어와도, 요일이 없는 동안은 정하지 않는다.
  assert.equal(lockHoursEditorMode(undefined, [], { MONDAY: nine }), undefined);
});

test('the mode is decided once from the first selected days', () => {
  assert.equal(
    lockHoursEditorMode(undefined, ['MONDAY', 'TUESDAY'], {
      MONDAY: nine,
      TUESDAY: night,
    }),
    'perDay'
  );
  assert.equal(
    lockHoursEditorMode(undefined, ['MONDAY', 'TUESDAY'], {
      MONDAY: nine,
      TUESDAY: nine,
    }),
    'single'
  );
  assert.equal(lockHoursEditorMode(undefined, ['SUNDAY'], {}), 'single');
});

test('a decided mode never changes when the values change', () => {
  const same = { MONDAY: nine, TUESDAY: nine };
  const different = { MONDAY: nine, TUESDAY: night };

  assert.equal(
    lockHoursEditorMode('perDay', ['MONDAY', 'TUESDAY'], same),
    'perDay'
  );
  assert.equal(
    lockHoursEditorMode('single', ['MONDAY', 'TUESDAY'], different),
    'single'
  );
  // 요일을 모두 꺼도 유지한다.
  assert.equal(lockHoursEditorMode('perDay', [], {}), 'perDay');
});

test('the data that arrives late decides the mode, not the empty form before it', () => {
  // 처음 렌더: 비어 있음 → 정하지 않음.
  let mode = lockHoursEditorMode(undefined, [], {});

  assert.equal(mode, undefined);

  // 기존 값이 들어옴(월·화 시간이 다름) → 이때 정해진다.
  mode = lockHoursEditorMode(mode, ['MONDAY', 'TUESDAY'], {
    MONDAY: nine,
    TUESDAY: { openTime: '10:00', closeTime: '18:00' },
  });

  assert.equal(mode, 'perDay');
});

test('editing Tuesday to match Monday does not make Monday follow later edits', () => {
  // 월 09:00-18:00, 화 10:00-18:00인 글을 수정한다.
  const days = ['MONDAY', 'TUESDAY'] as const;
  let times: Record<string, { openTime?: string; closeTime?: string }> = {
    MONDAY: { openTime: '09:00', closeTime: '18:00' },
    TUESDAY: { openTime: '10:00', closeTime: '18:00' },
  };
  const mode = lockHoursEditorMode(undefined, days, times);

  assert.equal(mode, 'perDay');

  // 화 시작을 09:00으로 바꾸면 값이 월과 같아지지만 모드는 그대로다.
  times = applyDayTimeChange(times, 'TUESDAY', 'openTime', '09:00');
  assert.equal(getHoursEditorMode(days, times), 'single');
  assert.equal(lockHoursEditorMode(mode, days, times), 'perDay');

  // 이어서 화 종료를 19:00으로 바꿔도 월은 그대로다.
  times = applyDayTimeChange(times, 'TUESDAY', 'closeTime', '19:00');

  assert.deepEqual(times.MONDAY, { openTime: '09:00', closeTime: '18:00' });
  assert.deepEqual(times.TUESDAY, { openTime: '09:00', closeTime: '19:00' });
});

test('changing one day in the per-day list leaves the others untouched', () => {
  const next = applyDayTimeChange(
    { MONDAY: nine, TUESDAY: night },
    'TUESDAY',
    'closeTime',
    '03:00'
  );

  assert.deepEqual(next.MONDAY, nine);
  assert.deepEqual(next.TUESDAY, { openTime: '18:00', closeTime: '03:00' });
});

test('a single-line start still writes to every selected day', () => {
  // 처음부터 한 줄인 입력은 지금처럼 전체 요일에 적용된다.
  const days = ['MONDAY', 'TUESDAY'] as const;
  const mode = lockHoursEditorMode(undefined, days, {
    MONDAY: nine,
    TUESDAY: nine,
  });
  const next = applySharedTime(
    days,
    { MONDAY: nine, TUESDAY: nine },
    {
      closeTime: '19:00',
    }
  );

  assert.equal(mode, 'single');
  assert.deepEqual(next.MONDAY, { openTime: '09:00', closeTime: '19:00' });
  assert.deepEqual(next.TUESDAY, { openTime: '09:00', closeTime: '19:00' });
});
