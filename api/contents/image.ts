import type { IncomingMessage, ServerResponse } from 'node:http';

import { fetchContentImage } from './imageProxy.ts';

const SUCCESS_CACHE_CONTROL =
  'public, s-maxage=86400, stale-while-revalidate=604800';

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  if (request.method !== 'GET') {
    response.statusCode = 405;
    response.end();
    return;
  }

  const targetUrl = new URL(
    request.url ?? '',
    'http://localhost'
  ).searchParams.get('url');
  if (!targetUrl) {
    response.statusCode = 400;
    response.end();
    return;
  }

  const result = await fetchContentImage(targetUrl);

  response.statusCode = result.status;
  response.setHeader('content-type', result.contentType);
  response.setHeader('x-content-type-options', 'nosniff');
  if (result.status === 200) {
    response.setHeader('cache-control', SUCCESS_CACHE_CONTROL);
  }
  response.end(result.body ? Buffer.from(result.body) : undefined);
}
