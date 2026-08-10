export const config = { runtime: 'edge' };

const REQUEST_TIMEOUT_MS = 8_000;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed.', { status: 405 });
  }

  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) {
    return new Response('ODsay API is not configured.', { status: 503 });
  }

  const params = new URLSearchParams(new URL(request.url).search);
  params.set('apiKey', apiKey);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.odsay.com/v1/api/searchPubTransPathT?${params}`,
      { signal: controller.signal }
    );

    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return new Response(
      controller.signal.aborted
        ? 'ODsay request timed out.'
        : 'ODsay request failed.',
      { status: controller.signal.aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
