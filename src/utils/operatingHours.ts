export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface OperatingDay {
  readonly dayOfWeek: DayOfWeek;
  /** HH:mm, 24시간 영업이면 openTime "00:00" / closeTime "23:59"으로 저장한다. */
  readonly openTime: string;
  readonly closeTime: string;
}

const KOREAN_WEEKDAY_TO_ENUM: Record<string, DayOfWeek> = {
  월요일: 'MONDAY',
  화요일: 'TUESDAY',
  수요일: 'WEDNESDAY',
  목요일: 'THURSDAY',
  금요일: 'FRIDAY',
  토요일: 'SATURDAY',
  일요일: 'SUNDAY',
};

const SHORT_WEEKDAY_TO_ENUM: Record<string, DayOfWeek> = {
  Sun: 'SUNDAY',
  Mon: 'MONDAY',
  Tue: 'TUESDAY',
  Wed: 'WEDNESDAY',
  Thu: 'THURSDAY',
  Fri: 'FRIDAY',
  Sat: 'SATURDAY',
};

function toTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

function formatClosingTimeForDisplay(time: string): string {
  return time === '00:00' || time === '24:00' ? '24:00' : toHourMinute(time);
}

// "오전 6:00" / "오후 11:30" 같은 구글 플레이스 한글 표기를 "HH:mm"로 바꾼다.
function parseKoreanTime(raw: string): string | null {
  const match = raw.trim().match(/^(오전|오후)\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const [, meridiem, hourText, minuteText] = match;
  let hour = Number(hourText);
  if (meridiem === '오후' && hour !== 12) hour += 12;
  if (meridiem === '오전' && hour === 12) hour = 0;

  return `${toTwoDigits(hour)}:${minuteText}`;
}

/**
 * 구글 플레이스 `regularWeekdayDescriptions`(한글, 요일당 한 줄)를
 * `OperatingDay[]`로 변환한다. 휴무일이나 파싱할 수 없는 줄은 건너뛴다.
 */
export function parseWeekdayDescriptionsToOperatingDays(
  weekdayDescriptions: readonly string[]
): OperatingDay[] {
  const operatingDays: OperatingDay[] = [];

  for (const description of weekdayDescriptions) {
    const separatorIndex = description.indexOf(':');
    if (separatorIndex === -1) continue;

    const dayOfWeek =
      KOREAN_WEEKDAY_TO_ENUM[description.slice(0, separatorIndex).trim()];
    const timeRange = description.slice(separatorIndex + 1).trim();
    if (!dayOfWeek || !timeRange) continue;

    if (/24\s*시간/.test(timeRange)) {
      operatingDays.push({ dayOfWeek, openTime: '00:00', closeTime: '23:59' });
      continue;
    }
    if (/휴무|정기휴무|closed/i.test(timeRange)) continue;

    const [openRaw, closeRaw] = timeRange
      .split(/[~–—]/)
      .map((part) => part.trim());
    const openTime = openRaw ? parseKoreanTime(openRaw) : null;
    const closeTime = closeRaw ? parseKoreanTime(closeRaw) : null;
    if (!openTime || !closeTime) continue;

    operatingDays.push({ dayOfWeek, openTime, closeTime });
  }

  return operatingDays;
}

function toMinutesSinceMidnight(time: string): number {
  const [hourText, minuteText] = time.split(':');
  return Number(hourText) * 60 + Number(minuteText);
}

function getSeoulNow(now: Date): { dayOfWeek: DayOfWeek; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const weekdayShort =
    parts.find((part) => part.type === 'weekday')?.value ?? '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value ?? '0'
  );

  return {
    dayOfWeek: SHORT_WEEKDAY_TO_ENUM[weekdayShort] ?? 'SUNDAY',
    minutes: hour * 60 + minute,
  };
}

function getPreviousDayOfWeek(dayOfWeek: DayOfWeek): DayOfWeek {
  const days: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];
  return days[(days.indexOf(dayOfWeek) + days.length - 1) % days.length];
}

const KOREAN_WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

const ALL_DAYS_OF_WEEK: readonly DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

function toHourMinute(time: string): string {
  return time.slice(0, 5);
}

export function isTwentyFourHoursEveryDay(
  operatingDays: readonly OperatingDay[]
): boolean {
  return ALL_DAYS_OF_WEEK.every((dayOfWeek) =>
    operatingDays.some(
      (day) =>
        day.dayOfWeek === dayOfWeek &&
        day.openTime === '00:00' &&
        day.closeTime === '23:59'
    )
  );
}

export function formatOperatingDay(operatingDay: OperatingDay): string {
  if (operatingDay.openTime === '00:00' && operatingDay.closeTime === '23:59') {
    return `${KOREAN_WEEKDAY_LABELS[operatingDay.dayOfWeek]} 24시간 영업`;
  }

  return `${KOREAN_WEEKDAY_LABELS[operatingDay.dayOfWeek]} ${toHourMinute(operatingDay.openTime)} - ${formatClosingTimeForDisplay(operatingDay.closeTime)}`;
}

export function formatTodayOperatingHours(
  operatingDays: readonly OperatingDay[],
  now: Date = new Date()
): string | undefined {
  if (isTwentyFourHoursEveryDay(operatingDays)) return '24시간 영업';

  const { dayOfWeek } = getSeoulNow(now);
  const today = operatingDays.find((day) => day.dayOfWeek === dayOfWeek);

  return today
    ? `${toHourMinute(today.openTime)} - ${formatClosingTimeForDisplay(today.closeTime)}`
    : undefined;
}

/**
 * 한국 표준시(Asia/Seoul) 기준 현재 요일·시각을 영업시간 목록과 비교해
 * 영업 중 여부를 계산한다. 오늘자 영업시간 정보가 없으면(휴무로 파싱됐거나
 * 애초에 없으면) 영업 종료로 본다. 영업시간 데이터 자체가 비어 있으면
 * 판단할 수 없으므로 undefined를 반환한다.
 */
export function isOperatingNow(
  operatingDays: readonly OperatingDay[],
  now: Date = new Date()
): boolean | undefined {
  if (operatingDays.length === 0) return undefined;

  const { dayOfWeek, minutes } = getSeoulNow(now);
  const today = operatingDays.find((day) => day.dayOfWeek === dayOfWeek);
  if (!today) return false;

  const openMinutes = toMinutesSinceMidnight(today.openTime);
  const closeMinutes = toMinutesSinceMidnight(today.closeTime);

  // The normalized representation for a 24-hour schedule is 00:00-23:59.
  if (today.openTime === '00:00' && today.closeTime === '23:59') {
    return true;
  }

  // 자정을 넘겨 닫는 경우(예: 20:00~02:00)를 포함해 정상적인 경우까지 한 식으로 처리한다.
  if (closeMinutes > openMinutes) {
    return minutes >= openMinutes && minutes < closeMinutes;
  }

  if (minutes >= openMinutes) return true;

  const previousDay = operatingDays.find(
    (day) => day.dayOfWeek === getPreviousDayOfWeek(dayOfWeek)
  );
  if (!previousDay) return false;

  const previousOpenMinutes = toMinutesSinceMidnight(previousDay.openTime);
  const previousCloseMinutes = toMinutesSinceMidnight(previousDay.closeTime);
  return (
    previousCloseMinutes <= previousOpenMinutes &&
    minutes < previousCloseMinutes
  );
}
