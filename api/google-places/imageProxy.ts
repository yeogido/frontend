// admin course-registration에서 장소 사진을 직접 올리지 않고 구글 이미지로
// 넘어가면, 클라이언트가 googleusercontent.com을 크로스오리진으로 직접
// fetch해서 File로 만들어야 했다 — CORS에 기대는 취약한 방식이라, 우리
// 서버가 대신 내려받아 같은 오리진으로 돌려주는 프록시를 둔다. photoUri
// 자체는 공개 URL이라 API 키는 필요 없지만, 임의 URL을 그대로 fetch하면
// SSRF가 되므로 구글 이미지 호스트만 허용한다.
const ALLOWED_HOSTNAME_SUFFIXES = ['.googleusercontent.com'];
const IMAGE_PROXY_TIMEOUT_MS = 8000;

function isAllowedGoogleImageUrl(rawUrl: string): URL | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const isAllowed =
    url.protocol === 'https:' &&
    ALLOWED_HOSTNAME_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix));

  return isAllowed ? url : null;
}

export interface ProxiedImage {
  readonly status: number;
  readonly contentType: string;
  readonly body: ArrayBuffer | null;
}

export async function fetchGoogleImage(
  targetUrl: string
): Promise<ProxiedImage> {
  const url = isAllowedGoogleImageUrl(targetUrl);
  if (!url) {
    return { status: 400, contentType: 'text/plain', body: null };
  }

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      signal: AbortSignal.timeout(IMAGE_PROXY_TIMEOUT_MS),
    });
  } catch {
    return { status: 502, contentType: 'text/plain', body: null };
  }

  if (!upstream.ok) {
    return { status: 502, contentType: 'text/plain', body: null };
  }

  return {
    status: 200,
    contentType: upstream.headers.get('content-type') ?? 'image/jpeg',
    body: await upstream.arrayBuffer(),
  };
}
