export const config = { runtime: 'edge' };

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_WIDTH = 2_048;
const MAX_HEIGHT = 1_024;

function errorResponse(message: string, status: number) {
  return new Response(message, { status });
}

function isCoordinatePair(value: string | null): value is string {
  if (!value) return false;

  const [longitude, latitude] = value.split(',').map(Number);
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function isMapSize(value: string | null): value is string {
  if (!value) return false;

  const match = /^(\d{1,4})x(\d{1,4})$/.exec(value);
  if (!match) return false;

  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && width <= MAX_WIDTH && height > 0 && height <= MAX_HEIGHT;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed.', 405);
  }

  const incomingUrl = new URL(request.url);
  const center = incomingUrl.searchParams.get('center');
  const size = incomingUrl.searchParams.get('size');
  const level = Number(incomingUrl.searchParams.get('lv'));

  if (!isCoordinatePair(center) || !isMapSize(size)) {
    return errorResponse('Invalid map request.', 400);
  }
  if (!Number.isInteger(level) || level < 1 || level > 15) {
    return errorResponse('Invalid map level.', 400);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      center,
      size,
      lv: String(level),
      scale: '1',
      format: 'png',
    });
    const kakaoResponse = await fetch(
      `https://dapi.kakao.com/v2/maps/staticmap?${params}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
        },
        signal: controller.signal,
      }
    );

    return new Response(kakaoResponse.body, {
      status: kakaoResponse.status,
      headers: {
        'content-type': kakaoResponse.headers.get('content-type') ?? 'image/png',
      },
    });
  } catch {
    return errorResponse(
      controller.signal.aborted
        ? 'Kakao static map request timed out.'
        : 'Kakao static map request failed.',
      controller.signal.aborted ? 504 : 502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
