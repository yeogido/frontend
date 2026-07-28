import assert from 'node:assert/strict';
import test from 'node:test';

import { createImageObjectUrl } from '../src/components/sticker/imageObjectUrl.ts';

test('releases only the object URL created for an uploaded sticker image', () => {
  const revokedUrls: string[] = [];
  const resource = createImageObjectUrl(
    {} as File,
    {
      createObjectURL: () => 'blob:uploaded-sticker',
      revokeObjectURL: (url) => revokedUrls.push(url),
    },
  );

  assert.equal(resource.url, 'blob:uploaded-sticker');
  resource.dispose();
  assert.deepEqual(revokedUrls, ['blob:uploaded-sticker']);
});
