import {
  ALL_DAY_BUSINESS_HOUR,
  isAllDayBusinessHour,
} from '../../../utils/promotionBusinessHours.ts';
import type { DayOfWeek, DayTimeEntry } from './schema.ts';

// 폼 라이브러리를 import하지 않는다. 모바일 영업시간 입력의 "한 줄로 선택한 요일
// 전체에 같은 시간을 적용" 판단과 변환만 담아 Node 테스트 러너에서 그대로 검증한다.
// 폼 상태는 요일별 시간(dayTimes) 구조를 그대로 둔다.

type DayTimes = Record<string, DayTimeEntry | undefined>;

/** single: 선택한 요일의 시간이 모두 같아 한 줄로 보인다. perDay: 요일별로 다르다. */
export type HoursEditorMode = 'single' | 'perDay';

// 24시간은 서버 값(00:00~00:00)과 기존 값(00:00~23:59)을 같은 것으로 본다.
function toComparableKey(entry: DayTimeEntry | undefined): string {
  return isAllDayBusinessHour(entry?.openTime, entry?.closeTime)
    ? 'all-day'
    : `${entry?.openTime ?? ''}|${entry?.closeTime ?? ''}`;
}

/**
 * 한 줄로 보여 줄 수 있는지. 선택한 요일의 시간이 모두 같으면(비어 있는 것끼리도
 * 같다) 한 줄이고, 하나라도 다르면 요일별 목록이다. 요일마다 다른 시간으로 만든
 * 글을 수정할 때 한 줄 입력이 다른 요일의 시간을 덮어쓰지 않게 한다.
 */
export function getHoursEditorMode(
  openDays: readonly DayOfWeek[],
  dayTimes: DayTimes
): HoursEditorMode {
  const keys = new Set(openDays.map((day) => toComparableKey(dayTimes[day])));

  return keys.size <= 1 ? 'single' : 'perDay';
}

/**
 * 화면의 영업시간 입력 모드를 처음 한 번만 정한다. 이미 정해졌으면 값이 우연히 같아져도
 * 바꾸지 않고, 선택한 요일이 아직 없으면(수정 모드에서 기존 값이 늦게 들어오는 경우
 * 포함) 정하지 않고 undefined를 돌려준다. 요일별 목록으로 시작한 글을 편집하다 두 요일의
 * 시간이 같아졌다고 한 줄로 바뀌면, 이어지는 한 줄 입력이 건드리지 않은 요일까지
 * 바꾸기 때문이다.
 */
export function lockHoursEditorMode(
  lockedMode: HoursEditorMode | undefined,
  openDays: readonly DayOfWeek[],
  dayTimes: DayTimes
): HoursEditorMode | undefined {
  if (lockedMode !== undefined) return lockedMode;
  if (openDays.length === 0) return undefined;

  return getHoursEditorMode(openDays, dayTimes);
}

/** 한 줄에 보여 줄 값. 선택한 요일 중 첫 요일의 시간이고, 요일이 없으면 빈 값이다. */
export function getSharedEntry(
  openDays: readonly DayOfWeek[],
  dayTimes: DayTimes
): DayTimeEntry {
  const first = openDays[0];

  return first === undefined ? {} : { ...dayTimes[first] };
}

/** 한 줄에서 바꾼 시작·종료 시간을 선택한 요일 전체에 쓴다. */
export function applySharedTime(
  openDays: readonly DayOfWeek[],
  dayTimes: DayTimes,
  patch: DayTimeEntry
): DayTimes {
  const next = { ...getSharedEntry(openDays, dayTimes), ...patch };
  const result = { ...dayTimes };

  for (const day of openDays) {
    result[day] = { ...next };
  }

  return result;
}

/** 요일별 목록에서 한 요일의 시작 또는 종료 시간만 바꾼다. 다른 요일은 건드리지 않는다. */
export function applyDayTimeChange(
  dayTimes: DayTimes,
  day: DayOfWeek,
  field: 'openTime' | 'closeTime',
  value: string
): DayTimes {
  return { ...dayTimes, [day]: { ...dayTimes[day], [field]: value } };
}

/**
 * 요일을 바꾼 뒤의 시간 값. 한 줄 모드에서 요일을 더하면 지금 한 줄의 값이 새
 * 요일에도 들어간다(이전에 남아 있던 그 요일의 값은 덮어쓴다). 요일별 모드에서는
 * 그대로 둔다. 모드는 화면이 처음 정한 값(lockHoursEditorMode)을 넘긴다.
 */
export function applyDaysChange(
  mode: HoursEditorMode,
  previousDays: readonly DayOfWeek[],
  nextDays: readonly DayOfWeek[],
  dayTimes: DayTimes
): DayTimes {
  if (mode === 'perDay') return dayTimes;

  const added = nextDays.filter((day) => !previousDays.includes(day));

  if (added.length === 0) return dayTimes;

  const shared = getSharedEntry(previousDays, dayTimes);
  const result = { ...dayTimes };

  for (const day of added) {
    result[day] = { ...shared };
  }

  return result;
}

/** 선택한 요일이 모두 24시간이다(요일이 없으면 아니다). */
export function isAllDayForSelectedDays(
  openDays: readonly DayOfWeek[],
  dayTimes: DayTimes
): boolean {
  return (
    openDays.length > 0 &&
    openDays.every((day) =>
      isAllDayBusinessHour(dayTimes[day]?.openTime, dayTimes[day]?.closeTime)
    )
  );
}

/**
 * 24시간을 켜거나 끈 뒤의 시간 값. 켜면 선택한 요일 전체가 서버 규격(00:00~00:00)이
 * 되고, 끄면 켜기 전에 입력해 둔 값(없으면 빈 값)으로 돌아간다.
 */
export function applyAllDay(
  openDays: readonly DayOfWeek[],
  dayTimes: DayTimes,
  checked: boolean,
  beforeAllDay: DayTimeEntry = {}
): DayTimes {
  const entry: DayTimeEntry = checked
    ? { ...ALL_DAY_BUSINESS_HOUR }
    : isAllDayBusinessHour(beforeAllDay.openTime, beforeAllDay.closeTime)
      ? {}
      : { ...beforeAllDay };
  const result = { ...dayTimes };

  for (const day of openDays) {
    result[day] = { ...entry };
  }

  return result;
}

/** 한 줄 아래에 보일 오류. 요일마다 같은 값이라 선택한 요일 중 첫 문구만 쓴다. */
export function getSharedErrorMessage(
  openDays: readonly DayOfWeek[],
  errorMessageByDay: Partial<Record<DayOfWeek, string>>
): string | undefined {
  for (const day of openDays) {
    const message = errorMessageByDay[day];

    if (message) return message;
  }

  return undefined;
}
