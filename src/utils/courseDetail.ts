import type { TimeFromPrevious } from '../apis/localRecommendations';

/** 일차 정보가 없는 기존 코스는 1일차로 표시한다. */
export function normalizeCourseDay(day: number | undefined): number {
  return typeof day === 'number' && Number.isSafeInteger(day) && day > 0
    ? day
    : 1;
}

export function groupCourseStopsByDay<
  T extends { day?: number; order: number },
>(stops: readonly T[]): { day: number; stops: T[] }[] {
  const groups = new Map<number, T[]>();

  for (const stop of stops) {
    const day = normalizeCourseDay(stop.day);
    const group = groups.get(day) ?? [];
    group.push(stop);
    groups.set(day, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, items]) => ({
      day,
      stops: [...items].sort((a, b) => a.order - b.order),
    }));
}

export function getCourseDayLabel(day: number): string {
  return `${day}일차`;
}

export type CourseDurationType =
  'DAY_TRIP' | 'ONE_NIGHT' | 'TWO_NIGHT' | 'THREE_PLUS';

/** 일수가 고정인 기간들. THREE_PLUS만 사용자가 일차를 더 늘릴 수 있다. */
const FIXED_TOTAL_DAYS: Record<
  Exclude<CourseDurationType, 'THREE_PLUS'>,
  number
> = {
  DAY_TRIP: 1,
  ONE_NIGHT: 2,
  TWO_NIGHT: 3,
};

export const THREE_PLUS_MIN_TOTAL_DAYS = 4;

/**
 * 일차 추가 버튼의 상한. 서버 규칙이 아니라 화면 쪽 안전장치다 —
 * THREE_PLUS는 일수 상한이 없어, 실수로 수십 일차가 만들어지는 걸 막는다.
 */
export const COURSE_MAX_TOTAL_DAYS = 10;

/** 기간 칩에 쓰는 라벨. 1일은 '당일치기', 그 외에는 'N박M일'(디자인 표기). */
export function getCourseDurationLabel(totalDays: number): string {
  const days = Math.max(totalDays, 1);

  return days <= 1 ? '당일치기' : `${days - 1}박${days}일`;
}

const DAY_ORDINALS = [
  '첫째날',
  '둘째날',
  '셋째날',
  '넷째날',
  '다섯째날',
  '여섯째날',
  '일곱째날',
  '여덟째날',
  '아홉째날',
  '열째날',
] as const;

/** '첫째날의 일정을 추가해보세요'처럼 일차를 순우리말 서수로 부를 때 쓴다. */
export function getCourseDayOrdinal(day: number): string {
  return DAY_ORDINALS[Math.max(day, 1) - 1] ?? `${day}일차`;
}

/**
 * 기간에 해당하는 여행 일수. THREE_PLUS는 실제 일수가 가변이라, 이미 알고 있는
 * 일수(currentTotalDays)가 4 이상이면 그 값을 유지하고 아니면 최소값으로 맞춘다.
 */
export function getTotalDaysForDuration(
  durationType: CourseDurationType,
  currentTotalDays?: number
): number {
  if (durationType !== 'THREE_PLUS') {
    return FIXED_TOTAL_DAYS[durationType];
  }

  return currentTotalDays !== undefined &&
    currentTotalDays >= THREE_PLUS_MIN_TOTAL_DAYS
    ? currentTotalDays
    : THREE_PLUS_MIN_TOTAL_DAYS;
}

/** 일차를 추가/삭제해 일수가 바뀌었을 때 따라가야 할 기간 값. */
export function getDurationTypeForTotalDays(
  totalDays: number
): CourseDurationType {
  if (totalDays <= 1) return 'DAY_TRIP';
  if (totalDays === 2) return 'ONE_NIGHT';
  if (totalDays === 3) return 'TWO_NIGHT';

  return 'THREE_PLUS';
}

export function isTotalDaysValidForDuration(
  durationType: CourseDurationType,
  totalDays: number
): boolean {
  if (!Number.isSafeInteger(totalDays)) return false;

  return durationType === 'THREE_PLUS'
    ? totalDays >= THREE_PLUS_MIN_TOTAL_DAYS
    : totalDays === FIXED_TOTAL_DAYS[durationType];
}

/**
 * 일차별 배열의 길이를 totalDays에 맞춘다. 일차가 줄어들 때 잘려나갈 항목은
 * 버리지 않고 마지막 일차로 모은다 — 사용자가 고른 걸 말없이 날리지 않는다.
 */
export function padVisitOrderToDays<T>(
  visitOrder: readonly (readonly T[])[],
  totalDays: number
): T[][] {
  const dayCount = Math.max(totalDays, 1);

  if (visitOrder.length <= dayCount) {
    return Array.from({ length: dayCount }, (_, day) => [
      ...(visitOrder[day] ?? []),
    ]);
  }

  const dropped = visitOrder.slice(dayCount).flat();

  return visitOrder
    .slice(0, dayCount)
    .map((dayItems, index) =>
      index === dayCount - 1 ? [...dayItems, ...dropped] : [...dayItems]
    );
}

/**
 * 상세 응답의 여행 일수. 일차 확장 이전에 만들어진 응답에는 totalDays가 없어,
 * 그런 경우 항목들의 가장 큰 일차로(그것도 없으면 1일로) 보정한다.
 */
export function resolveCourseTotalDays(detail: {
  totalDays?: number;
  courseItems?: readonly { day?: number }[];
}): number {
  const { totalDays, courseItems = [] } = detail;

  if (
    typeof totalDays === 'number' &&
    Number.isSafeInteger(totalDays) &&
    totalDays > 0
  ) {
    return totalDays;
  }

  return courseItems.reduce(
    (max, item) => Math.max(max, normalizeCourseDay(item.day)),
    1
  );
}

const TRANSPORT_LABELS = {
  WALK: '도보',
  CAR: '차량',
  PUBLIC: '대중교통',
} as const;

/** 차량은 짧은 구간도 표시하며, 도보는 30분 미만인 경우만 표시한다. */
export function getCourseTransportInfo(times: readonly TimeFromPrevious[]) {
  return (['WALK', 'CAR', 'PUBLIC'] as const).flatMap((mode) => {
    const time = times.find((item) => item.transportMode === mode);
    if (
      !time ||
      !Number.isFinite(time.durationMinutes) ||
      time.durationMinutes < 0 ||
      (mode === 'WALK' && time.durationMinutes >= 30)
    ) {
      return [];
    }

    return [{ ...time, label: TRANSPORT_LABELS[mode] }];
  });
}
