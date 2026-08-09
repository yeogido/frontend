export const config = { runtime: 'edge' };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();

function json(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function getClientId(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isRateLimited(clientId: string, now: number) {
  const entry = rateLimitEntries.get(clientId);
  if (!entry || entry.resetAt <= now) {
    rateLimitEntries.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function isKnownBot(request: Request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';
  return /bot|crawler|spider|scrapy|curl|wget/.test(userAgent);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json('Method not allowed.', 405);
  if (isKnownBot(request)) return json('Automated clients are not allowed.', 403);
  if (isRateLimited(getClientId(request), Date.now())) {
    return json('Too many requests.', 429);
  }

  const { search } = new URL(request.url);

  const kakaoResponse = await fetch(
    `https://apis-navi.kakaomobility.com/v1/directions${search}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      },
    }
  );

  return new Response(kakaoResponse.body, {
    status: kakaoResponse.status,
    headers: {
      'content-type':
        kakaoResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}
