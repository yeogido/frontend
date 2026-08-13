import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchContentImage } from '../api/contents/imageProxy.ts';

const TOURISM_IMAGE_URL =
  'https://tong.visitkorea.or.kr/cms/resource/02/4090202_image2_1.jpg';
const YEOGIDO_IMAGE_URL =
  'https://d2vdji7rc2q3wv.cloudfront.net/contents/event.jpg';

test('proxies the exact Yeogido CloudFront image host', async (t) => {
  const originalFetch = globalThis.fetch;
  const imageBytes = new Uint8Array([1, 2, 3]);

  globalThis.fetch = async () =>
    new Response(imageBytes, {
      status: 200,
      headers: { 'content-type': 'image/jpeg' },
    });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await fetchContentImage(YEOGIDO_IMAGE_URL);

  assert.equal(result.status, 200);
  assert.equal(result.contentType, 'image/jpeg');
  assert.deepEqual(
    new Uint8Array(result.body ?? new ArrayBuffer(0)),
    imageBytes
  );
});

test('requests Tourism Organization media with explicit image headers', async (t) => {
  const originalFetch = globalThis.fetch;
  let requestHeaders = new Headers();

  globalThis.fetch = async (_input, init) => {
    requestHeaders = new Headers(init?.headers);
    return new Response(new Uint8Array([1]), {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await fetchContentImage(TOURISM_IMAGE_URL);

  assert.equal(result.status, 200);
  assert.match(requestHeaders.get('accept') ?? '', /image\/\*/);
  assert.equal(requestHeaders.get('user-agent'), 'Yeogido-Image-Proxy/1.0');
});

test('rejects a successful upstream response that is not an image', async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response('<html>not an image</html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await fetchContentImage(TOURISM_IMAGE_URL);

  assert.deepEqual(result, {
    status: 502,
    contentType: 'text/plain',
    body: null,
  });
});

test('rejects unlisted CloudFront distributions', async () => {
  const result = await fetchContentImage(
    'https://untrusted.cloudfront.net/contents/event.jpg'
  );

  assert.deepEqual(result, {
    status: 400,
    contentType: 'text/plain',
    body: null,
  });
});

test('rejects an upstream redirect instead of following an unvalidated target', async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (_input, init) => {
    if (init?.redirect === 'error') {
      throw new TypeError('redirect blocked');
    }

    return new Response('unvalidated image', {
      status: 200,
      headers: { 'content-type': 'image/jpeg' },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await fetchContentImage(
    TOURISM_IMAGE_URL
  );

  assert.deepEqual(result, {
    status: 502,
    contentType: 'text/plain',
    body: null,
  });
});
