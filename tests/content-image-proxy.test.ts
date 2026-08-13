import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchContentImage } from '../api/contents/imageProxy.ts';

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
    'https://tong.visitkorea.or.kr/cms/resource/festival.jpg'
  );

  assert.deepEqual(result, {
    status: 502,
    contentType: 'text/plain',
    body: null,
  });
});
