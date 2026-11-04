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
