export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const { search } = new URL(request.url);

  const kakaoResponse = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json${search}`,
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
