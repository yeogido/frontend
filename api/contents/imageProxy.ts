// 관광공사 동기화 콘텐츠(행사/CONTENT)의 썸네일은 tong.visitkorea.or.kr 등
// 외부 호스트에서 직접 내려오는데, 이 호스트는 CORS 헤더를 안 내려줘서
// 브라우저가 크로스오리진으로 캔버스에 그리면(routeImage 생성 시 핀 이미지)
// 이미지 로드 자체가 실패한다. google-places/imageProxy.ts와 동일하게 우리
// 서버가 대신 내려받아 같은 오리진으로 돌려준다. 임의 URL을 그대로 fetch하면
// SSRF가 되므로 관광공사 이미지 호스트만 허용한다.
const ALLOWED_HOSTNAME_SUFFIXES = ['.visitkorea.or.kr'];
const IMAGE_PROXY_TIMEOUT_MS = 8000;

function isAllowedContentImageUrl(rawUrl: string): URL | null {
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

export async function fetchContentImage(
  targetUrl: string
): Promise<ProxiedImage> {
  const url = isAllowedContentImageUrl(targetUrl);
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
