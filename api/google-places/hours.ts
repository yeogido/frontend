import {
  InvalidPlaceHoursRequestError,
  lookupPlaceHours,
  type PlaceHoursRequest,
} from './placeHours.js';

export const config = { runtime: 'edge' };

const CACHE_TTL_MS = 1000 * 60 * 5;
const RATE_LIMIT_WINDOW_MS = 1000 * 60;
const RATE_LIMIT_MAX_REQUESTS = 30;

const responseCache = new Map<
  string,
  {
    readonly expiresAt: number;
    readonly body: Awaited<ReturnType<typeof lookupPlaceHours>>;
  }
>();
const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed.' }, 405);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return json({ message: 'Google Places API is not configured.' }, 503);
  }

  let requestBody: PlaceHoursRequest;
  try {
    requestBody = (await request.json()) as PlaceHoursRequest;
  } catch {
    return json({ message: 'Invalid request body.' }, 400);
  }

  const now = Date.now();
  const cacheKey = JSON.stringify(requestBody);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return json(cached.body);
  }

  if (isRateLimited(getClientId(request), now)) {
    return json({ message: 'Too many requests.' }, 429);
  }

  try {
    const body = await lookupPlaceHours(requestBody, apiKey);
    responseCache.set(cacheKey, { body, expiresAt: now + CACHE_TTL_MS });
    return json(body);
  } catch (error) {
    if (error instanceof InvalidPlaceHoursRequestError) {
      return json({ message: error.message }, 400);
    }

    return json({ message: 'Google Places request failed.' }, 502);
  }
}
