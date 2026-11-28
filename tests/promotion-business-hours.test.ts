import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatOperatingDay,
  isOperatingNow,
  isTwentyFourHoursEveryDay,
} from '../src/utils/operatingHours.ts';
import {
  ALL_DAY_BUSINESS_HOUR,
  isAllDayBusinessHour,
  isValidBusinessHourRange,
  normalizeServerBusinessHour,
} from '../src/utils/promotionBusinessHours.ts';
import {
  promotionInfoSchema,
  toPromotionInfoResult,
} from '../src/pages/business-promotion-registration/promotion-info/schema.ts';

test('the 24-hour value follows the server spec', () => {
  assert.deepEqual(ALL_DAY_BUSINESS_HOUR, {
    openTime: '00:00',
    closeTime: '00:00',
  });
});

test('both the server and the legacy 24-hour values count as all day', () => {
  assert.equal(isAllDayBusinessHour('00:00', '00:00'), true);
  assert.equal(isAllDayBusinessHour('00:00', '23:59'), true);
  assert.equal(isAllDayBusinessHour('09:00', '23:59'), false);
  assert.equal(isAllDayBusinessHour('00:00', '18:00'), false);
  assert.equal(isAllDayBusinessHour(undefined, undefined), false);
});

test('an ordinary range and an overnight range are valid', () => {
  assert.equal(isValidBusinessHourRange('09:00', '18:00'), true);
  assert.equal(isValidBusinessHourRange('18:00', '02:00'), true);
});

test('the same start and end is rejected except 00:00 to 00:00', () => {
  assert.equal(isValidBusinessHourRange('09:00', '09:00'), false);
  assert.equal(isValidBusinessHourRange('23:30', '23:30'), false);
  assert.equal(isValidBusinessHourRange('00:00', '00:00'), true);
});

test('missing or malformed times are not a valid range', () => {
  assert.equal(isValidBusinessHourRange(undefined, '18:00'), false);
  assert.equal(isValidBusinessHourRange('09:00', undefined), false);
  assert.equal(isValidBusinessHourRange('9:00', '18:00'), false);
  assert.equal(isValidBusinessHourRange('24:00', '18:00'), false);
});

test('a server 24-hour value is shown as 24-hour by operatingHours', () => {
  const day = normalizeServerBusinessHour({
    dayOfWeek: 'MONDAY' as const,
    openTime: '00:00',
    closeTime: '00:00',
  });

  assert.equal(formatOperatingDay(day), '월요일 24시간 영업');
  assert.equal(
    isOperatingNow([day], new Date('2026-11-23T05:00:00+09:00')),
    true
  );
});

test('the legacy 24-hour value keeps showing as 24-hour', () => {
  const day = normalizeServerBusinessHour({
    dayOfWeek: 'MONDAY' as const,
    openTime: '00:00',
    closeTime: '23:59',
  });

  assert.equal(formatOperatingDay(day), '월요일 24시간 영업');
});

test('normalizing leaves ordinary hours untouched', () => {
  const hour = { dayOfWeek: 'FRIDAY', openTime: '09:00', closeTime: '18:00' };

  assert.deepEqual(normalizeServerBusinessHour(hour), hour);
});

test('every day on the server 24-hour value reads as 24-hour every day', () => {
  const days = (
    [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ] as const
  ).map((dayOfWeek) =>
    normalizeServerBusinessHour({
      dayOfWeek,
      openTime: '00:00',
      closeTime: '00:00',
    })
  );

  assert.equal(isTwentyFourHoursEveryDay(days), true);
});

const baseValues = {
  shortDescription: '소개',
  openDays: ['MONDAY' as const],
  dayTimes: { MONDAY: { openTime: '18:00', closeTime: '02:00' } },
  phoneNumber: '010-0000-0000',
  snsAccount: '',
};

test('the schema allows an overnight range', () => {
  assert.equal(promotionInfoSchema.safeParse(baseValues).success, true);
});

test('the schema allows 00:00 to 00:00 but rejects other equal times', () => {
  assert.equal(
    promotionInfoSchema.safeParse({
      ...baseValues,
      dayTimes: { MONDAY: { openTime: '00:00', closeTime: '00:00' } },
    }).success,
    true
  );

  const result = promotionInfoSchema.safeParse({
    ...baseValues,
    dayTimes: { MONDAY: { openTime: '09:00', closeTime: '09:00' } },
  });

  assert.equal(result.success, false);
  assert.equal(
    result.error?.issues[0]?.message,
    '시작 시간과 종료 시간을 다르게 선택해 주세요.'
  );
});

test('the schema rejects a SNS input that is not an address', () => {
  const result = promotionInfoSchema.safeParse({
    ...baseValues,
    snsAccount: '@abc',
  });

  assert.equal(result.success, false);
  assert.equal(
    result.error?.issues[0]?.message,
    'SNS 주소를 링크 형태로 입력해 주세요. (예: instagram.com/아이디)'
  );
});

test('the result sends https:// for SNS and nothing when it is empty', () => {
  const withSns = toPromotionInfoResult({
    ...baseValues,
    snsAccount: ' instagram.com/x ',
  });
  const withoutSns = toPromotionInfoResult(baseValues);

  assert.equal(withSns.snsAccount, 'https://instagram.com/x');
  assert.equal(
    'snsAccount' in withoutSns && withoutSns.snsAccount !== undefined,
    false
  );
  assert.deepEqual(withSns.businessHours, [
    { dayOfWeek: 'MONDAY', openTime: '18:00', closeTime: '02:00' },
  ]);
});
