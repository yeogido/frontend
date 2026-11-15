import type { GeoPoint } from '../components/kakaomap/types';
import type { TimeFromPrevious } from './localRecommendations';
import { fetchKakaoCarRouteDuration } from './kakaoRouteDuration.ts';
import { fetchOdsayTransitDurationMinutes } from './odsayTransitDuration.ts';
import { fetchTmapWalkingDurationMinutes } from './tmapWalkingDuration.ts';

/** 한 이동수단의 조회 실패가 나머지 이동시간 저장을 막지 않는다. */
export async function fetchCourseTravelTimes(
  start: GeoPoint,
  end: GeoPoint,
  signal?: AbortSignal
): Promise<TimeFromPrevious[]> {
  const results = await Promise.allSettled([
    fetchTmapWalkingDurationMinutes(start, end, signal),
    fetchKakaoCarRouteDuration(start, end, signal),
    fetchOdsayTransitDurationMinutes(start, end, signal),
  ]);
  const modes = ['WALK', 'CAR', 'PUBLIC'] as const;

  return results.flatMap((result, index) => {
    if (
      result.status !== 'fulfilled' ||
      result.value === null ||
      !Number.isFinite(result.value) ||
      result.value < 0
    )
      return [];
    return [
      {
        transportMode: modes[index],
        durationMinutes:
          modes[index] === 'CAR' ? Math.round(result.value / 60) : result.value,
      },
    ];
  });
}
