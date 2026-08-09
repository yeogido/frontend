import type { GeoPoint } from '../components/kakaomap/types';

// dapi.kakao.com/v2/routing/walk (걷기 전용 비공식 경로 API) 응답 형태.
// summary가 아니라 route.properties.totalTime(초)에 전체 소요시간이 담겨 온다.
interface KakaoWalkRouteResponse {
  readonly status: string;
  readonly route?: {
    readonly properties?: {
      readonly totalTime?: number;
    };
  };
}

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

export async function fetchKakaoWalkRouteDuration(
  start: GeoPoint,
  end: GeoPoint,
  signal?: AbortSignal
): Promise<number | null> {
  const params = new URLSearchParams({
    start_x: String(start.longitude),
    start_y: String(start.latitude),
    end_x: String(end.longitude),
    end_y: String(end.latitude),
  });

  const response = await fetch(`/kakao-routing/walk?${params}`, { signal });

  if (!response.ok) {
    throw new Error('Failed to request Kakao walk route duration.');
  }

  const data = (await response.json()) as KakaoWalkRouteResponse;

  return data.status === 'OK'
    ? (data.route?.properties?.totalTime ?? null)
    : null;
}
