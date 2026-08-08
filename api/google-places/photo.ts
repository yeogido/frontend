import {
  InvalidPlacePhotoRequestError,
  lookupPlacePhoto,
  type PlacePhotoRequest,
} from './placePhoto';
import { toOptionalCoordinate, toOptionalString } from './parseRequest.js';

export const config = { runtime: 'edge' };

const CACHE_TTL_MS = 1000 * 60 * 30;
const CACHE_MAX_ENTRIES = 500;
const RATE_LIMIT_WINDOW_MS = 1000 * 60;
const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_MAX_ENTRIES = 1000;

const responseCache = new Map<
  string,
  {
    readonly expiresAt: number;
    readonly body: Awaited<ReturnType<typeof lookupPlacePhoto>>;
  }
>();
const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();

// 클라이언트가 requestBody에 여분 필드를 섞어 보내도 같은 장소로 취급하도록
// 실제로 조회에 쓰이는 필드만으로 정규화한 키를 쓴다. 그냥 JSON.stringify한
// 원본 바디를 키로 쓰면 무관한 필드 차이로 캐시가 쪼개진다.
function buildCacheKey(requestBody: PlacePhotoRequest): string {
  const name = toOptionalString(requestBody.name) ?? '';
  const address = toOptionalString(requestBody.address) ?? '';
  const latitude = toOptionalCoordinate(requestBody.latitude) ?? '';
  const longitude = toOptionalCoordinate(requestBody.longitude) ?? '';

  return `${name}|${address}|${latitude}|${longitude}`;
}

// 엣지 함수 인스턴스는 재사용되는 동안 계속 살아있으므로, 만료된 항목을 지워
// 주지 않으면 두 맵 모두 무한정 커진다. 요청마다 만료분을 걷어내고, 그래도
// 상한을 넘으면(자연 만료가 안 되는 rate-limit 카운터 등) 가장 오래된 항목부터
// 지워 상한을 지킨다.
function pruneExpired<K, V>(
  entries: Map<K, V>,
  isExpired: (value: V) => boolean,
  maxEntries: number
) {
  for (const [key, value] of entries) {
    if (isExpired(value)) {
      entries.delete(key);
    }
  }

  while (entries.size > maxEntries) {
    const oldestKey = entries.keys().next().value;
    if (oldestKey === undefined) break;
    entries.delete(oldestKey);
  }
}

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

  let requestBody: PlacePhotoRequest;
  try {
    requestBody = (await request.json()) as PlacePhotoRequest;
  } catch {
    return json({ message: 'Invalid request body.' }, 400);
  }

  const now = Date.now();
  pruneExpired(
    responseCache,
    (entry) => entry.expiresAt <= now,
    CACHE_MAX_ENTRIES
  );
  pruneExpired(
    rateLimitEntries,
    (entry) => entry.resetAt <= now,
    RATE_LIMIT_MAX_ENTRIES
  );

  const cacheKey = buildCacheKey(requestBody);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return json(cached.body);
  }

  if (isRateLimited(getClientId(request), now)) {
    return json({ message: 'Too many requests.' }, 429);
  }

  try {
    const body = await lookupPlacePhoto(requestBody, apiKey);
    responseCache.set(cacheKey, { body, expiresAt: now + CACHE_TTL_MS });
    return json(body);
  } catch (error) {
    if (error instanceof InvalidPlacePhotoRequestError) {
      return json({ message: error.message }, 400);
    }

    return json({ message: 'Google Places request failed.' }, 502);
  }
}
