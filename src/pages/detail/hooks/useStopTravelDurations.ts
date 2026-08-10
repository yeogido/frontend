import { useQueries } from '@tanstack/react-query';

import { fetchKakaoCarRouteDuration } from '../../../apis/kakaoRouteDuration';
import { fetchOdsayTransitDurationMinutes } from '../../../apis/odsayTransitDuration';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import type { CourseStop } from '../types/courseDetail';

const DURATION_STALE_TIME = 1000 * 60 * 5;
const DURATION_GC_TIME = 1000 * 60 * 30;
const SECONDS_PER_MINUTE = 60;

export interface StopTravelDuration {
  readonly carMinutes?: number;
  readonly transitMinutes?: number;
}

interface StopPair {
  // 이전 코스 아이템 → 이번 코스 아이템 구간이므로, 소요시간은 "도착지"인
  // 이번 아이템(toId) 쪽에 표시한다. 즉 첫 번째 아이템은 비교 대상(이전
  // 아이템)이 없어 항상 비고, 마지막 아이템은 정상적으로 정보를 갖는다.
  readonly toId: number;
  readonly start: { latitude: number; longitude: number };
  readonly end: { latitude: number; longitude: number };
}

function toStopPairs(stops: readonly CourseStop[]): StopPair[] {
  const pairs: StopPair[] = [];

  for (let index = 0; index < stops.length - 1; index += 1) {
    const start = stops[index].location;
    const end = stops[index + 1].location;

    if (isValidGeoPoint(start) && isValidGeoPoint(end)) {
      pairs.push({ toId: stops[index + 1].id, start, end });
    }
  }

  return pairs;
}

function toMinutes(seconds: number | null | undefined): number | undefined {
  return seconds == null ? undefined : Math.round(seconds / SECONDS_PER_MINUTE);
}

const TRAVEL_MODES = ['car', 'transit'] as const;

export function useStopTravelDurations(
  stops: readonly CourseStop[]
): ReadonlyMap<number, StopTravelDuration> {
  const pairs = toStopPairs(stops);

  const queries = useQueries({
    queries: pairs.flatMap((pair) => [
      {
        queryKey: ['stopTravelDuration', 'car', pair.start, pair.end],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          fetchKakaoCarRouteDuration(pair.start, pair.end, signal),
        staleTime: DURATION_STALE_TIME,
        gcTime: DURATION_GC_TIME,
        retry: false,
      },
      {
        queryKey: ['stopTravelDuration', 'transit', pair.start, pair.end],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          fetchOdsayTransitDurationMinutes(pair.start, pair.end, signal),
        staleTime: DURATION_STALE_TIME,
        gcTime: DURATION_GC_TIME,
        retry: false,
      },
    ]),
  });

  return new Map(
    pairs.map((pair, index) => [
      pair.toId,
      {
        carMinutes: toMinutes(queries[index * TRAVEL_MODES.length]?.data),
        // ODsay는 이미 분 단위라 초 → 분 변환(toMinutes)이 필요 없다.
        transitMinutes:
          queries[index * TRAVEL_MODES.length + 1]?.data ?? undefined,
      },
    ])
  );
}
