export const config = { runtime: 'edge' };

const REQUEST_TIMEOUT_MS = 8_000;

export default async function handler(request: Request): Promise<Response> {
  const { search } = new URL(request.url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const kakaoResponse = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json${search}`,
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
        'content-type':
          kakaoResponse.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return new Response(
      controller.signal.aborted
        ? 'Kakao address request timed out.'
        : 'Kakao address request failed.',
      { status: controller.signal.aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
