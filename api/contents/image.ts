import { fetchContentImage } from './imageProxy';

export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }

  const targetUrl = new URL(request.url).searchParams.get('url');
  if (!targetUrl) {
    return new Response(null, { status: 400 });
  }

  const result = await fetchContentImage(targetUrl);

  return new Response(result.body, {
    status: result.status,
    headers: {
      'content-type': result.contentType,
      ...(result.status === 200
        ? { 'cache-control': 'public, max-age=3600' }
        : {}),
    },
  });
}
