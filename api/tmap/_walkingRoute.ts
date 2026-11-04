const WALKING_URL =
  'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1';

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function parsePoint(value: string | null): [number, number] | null {
  const parts = value?.split(',');
  if (!parts || parts.length !== 2 || parts.some((part) => !part.trim()))
    return null;
  const [longitude, latitude] = parts.map(Number);
  return Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    Math.abs(longitude) <= 180 &&
    Math.abs(latitude) <= 90
    ? [longitude, latitude]
    : null;
}

interface WalkingResponse {
  features?: { properties?: { totalTime?: number } }[];
}

/** 개발 서버와 배포 서버가 동일한 요청 검증·응답 변환을 사용한다. */
export async function handleWalkingRoute(
  request: Request,
  apiKey: string | undefined,
  fetcher: typeof fetch = fetch
): Promise<Response> {
  if (request.method !== 'GET')
    return json({ message: 'Method not allowed.' }, 405);

  const params = new URL(request.url).searchParams;
  const start = parsePoint(params.get('origin'));
  const end = parsePoint(params.get('destination'));
  if (!start || !end)
    return json({ message: 'Invalid route coordinates.' }, 400);
  if (!apiKey?.trim())
    return json({ message: 'Walking route API is not configured.' }, 503);

  try {
    const response = await fetcher(WALKING_URL, {
      method: 'POST',
      headers: {
        appKey: apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        startX: start[0],
        startY: start[1],
        endX: end[0],
        endY: end[1],
        startName: encodeURIComponent('출발'),
        endName: encodeURIComponent('도착'),
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        searchOption: '0',
      }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]),
    });

    if (!response.ok)
      return json({ message: 'Walking route provider request failed.' }, 502);
    const data = (await response.json()) as WalkingResponse;
    const seconds = data.features?.[0]?.properties?.totalTime;
    return json({
      durationSeconds:
        typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= 0
          ? seconds
          : null,
    });
  } catch {
    return json({ message: 'Walking route request failed or timed out.' }, 502);
  }
}
