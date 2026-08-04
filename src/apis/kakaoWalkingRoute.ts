import type { GeoPoint } from '../components/kakaomap/types';

const KAKAO_WALKING_ROUTE_URL = '/kakao-routing/walk';
const MAX_WAYPOINTS = 5;
const MAX_POINTS_PER_REQUEST = MAX_WAYPOINTS + 2;

interface KakaoWalkingRouteResponse {
  readonly status: string;
  readonly route?: {
    readonly legs?: readonly {
      readonly steps?: readonly {
        readonly path?: {
          readonly points?: readonly (readonly [number, number])[];
        };
      }[];
    }[];
  };
}

function splitIntoRouteRequests(points: readonly GeoPoint[]) {
  const requests: GeoPoint[][] = [];

  for (let start = 0; start < points.length - 1;) {
    const requestPoints = points.slice(start, start + MAX_POINTS_PER_REQUEST);
    requests.push(requestPoints);
    start += requestPoints.length - 1;
  }

  return requests;
}

function toWalkingRoutePoints(response: KakaoWalkingRouteResponse): GeoPoint[] {
  if (response.status !== 'OK' || !response.route?.legs) {
    throw new Error(
      `Kakao walking route request failed with status: ${response.status}`
    );
  }

  return response.route.legs.flatMap((leg) =>
    (leg.steps ?? []).flatMap((step) =>
      (step.path?.points ?? []).map(([longitude, latitude]) => ({
        latitude,
        longitude,
      }))
    )
  );
}

function removeAdjacentDuplicates(points: readonly GeoPoint[]): GeoPoint[] {
  return points.filter(
    (point, index) =>
      index === 0 ||
      point.latitude !== points[index - 1].latitude ||
      point.longitude !== points[index - 1].longitude
  );
}

async function requestWalkingRoute(
  points: readonly GeoPoint[],
  signal?: AbortSignal
): Promise<GeoPoint[]> {
  const [start, ...remainingPoints] = points;
  const end = remainingPoints.at(-1);

  if (!start || !end) {
    return [];
  }

  const viaPoints = remainingPoints.slice(0, -1);
  const params = new URLSearchParams({
    start_x: String(start.longitude),
    start_y: String(start.latitude),
    end_x: String(end.longitude),
    end_y: String(end.latitude),
  });

  if (viaPoints.length > 0) {
    params.set('via_x', viaPoints.map((point) => point.longitude).join(','));
    params.set('via_y', viaPoints.map((point) => point.latitude).join(','));
  }

  const response = await fetch(`${KAKAO_WALKING_ROUTE_URL}?${params}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to request Kakao walking route.');
  }

  return toWalkingRoutePoints(
    (await response.json()) as KakaoWalkingRouteResponse
  );
}

export async function fetchKakaoWalkingRoute(
  points: readonly GeoPoint[],
  signal?: AbortSignal
): Promise<GeoPoint[]> {
  if (points.length < 2) {
    return [];
  }

  const routeSegments = await Promise.all(
    splitIntoRouteRequests(points).map((requestPoints) =>
      requestWalkingRoute(requestPoints, signal)
    )
  );

  return removeAdjacentDuplicates(routeSegments.flat());
}
