import type { GeoPoint } from '../components/kakaomap/types';

// apis-navi.kakaomobility.com/v1/directions (카카오모빌리티 길찾기 API) 응답 형태.
interface KakaoCarDirectionsResponse {
  readonly routes?: readonly {
    readonly result_code: number;
    readonly summary?: {
      readonly duration?: number;
    };
  }[];
}

function toCoordinateParam(point: GeoPoint): string {
  return `${point.longitude},${point.latitude}`;
}

// react-query의 queryFn은 undefined를 반환할 수 없어(캐시 미스와 구분 불가),
// "경로 없음"은 null로 표현한다.
export async function fetchKakaoCarRouteDuration(
  start: GeoPoint,
  end: GeoPoint,
  signal?: AbortSignal
): Promise<number | null> {
  const params = new URLSearchParams({
    origin: toCoordinateParam(start),
    destination: toCoordinateParam(end),
  });

  const response = await fetch(`/kakao-routing/car?${params}`, { signal });

  if (!response.ok) {
    throw new Error('Failed to request Kakao car route duration.');
  }

  const data = (await response.json()) as KakaoCarDirectionsResponse;
  const route = data.routes?.[0];

  return route?.result_code === 0 ? (route.summary?.duration ?? null) : null;
}
