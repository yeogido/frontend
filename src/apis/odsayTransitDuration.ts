import type { GeoPoint } from '../components/kakaomap/types';

const ODSAY_SEARCH_URL = 'https://api.odsay.com/v1/api/searchPubTransPathT';

interface OdsayPath {
  readonly info?: {
    // 분 단위로 내려온다 (초 단위인 카카오 API와 다름).
    readonly totalTime?: number;
  };
}

interface OdsaySearchResponse {
  readonly result?: {
    readonly path?: readonly OdsayPath[];
  };
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
  };
}

// react-query의 queryFn은 undefined를 반환할 수 없어(캐시 미스와 구분 불가),
// "경로 없음"은 null로 표현한다.
export async function fetchOdsayTransitDurationMinutes(
  start: GeoPoint,
  end: GeoPoint,
  signal?: AbortSignal
): Promise<number | null> {
  const apiKey = import.meta.env.VITE_ODSAY_API_KEY;

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    apiKey,
    SX: String(start.longitude),
    SY: String(start.latitude),
    EX: String(end.longitude),
    EY: String(end.latitude),
  });

  const response = await fetch(`${ODSAY_SEARCH_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error('Failed to request ODsay transit route duration.');
  }

  const data = (await response.json()) as OdsaySearchResponse;

  if (data.error) {
    return null;
  }

  const totalTimes = (data.result?.path ?? [])
    .map((path) => path.info?.totalTime)
    .filter((time): time is number => typeof time === 'number');

  return totalTimes.length > 0 ? Math.min(...totalTimes) : null;
}
