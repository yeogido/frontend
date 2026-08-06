import assert from 'node:assert/strict';
import test from 'node:test';

import { revokeObjectUrl } from '../src/utils/objectUrl.ts';

test('releases an existing object URL', () => {
  const revokedUrls: string[] = [];
  const originalUrl = globalThis.URL;

  Object.defineProperty(globalThis, 'URL', {
    configurable: true,
    value: { revokeObjectURL: (url: string) => revokedUrls.push(url) },
  });

  try {
    revokeObjectUrl('blob:certificate-preview');
    assert.deepEqual(revokedUrls, ['blob:certificate-preview']);
  } finally {
    Object.defineProperty(globalThis, 'URL', {
      configurable: true,
      value: originalUrl,
    });
  }
});

test('does not attempt to release an empty object URL', () => {
  assert.doesNotThrow(() => revokeObjectUrl(null));
});
