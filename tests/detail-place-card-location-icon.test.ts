import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('uses the shared location icon instead of a place image', async () => {
  const source = await readFile(
    new URL('../src/pages/detail/components/DetailPlaceCard.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /import locationOn from ['"].*location-on\.svg['"]/);
  assert.match(source, /src=\{locationOn\}/);
  assert.doesNotMatch(source, /<img\s+src=\{imageUrl\}/);
});

test('uses the Figma vertical rhythm for place details', async () => {
  const source = await readFile(
    new URL('../src/pages/detail/components/DetailPlaceCard.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /const TITLE_LINE_HEIGHT = 20/);
  assert.match(source, /const META_LINE_HEIGHT = 12/);
  assert.match(source, /const META_GAP = 4/);
  assert.match(source, /lineHeight: `\$\{TITLE_LINE_HEIGHT\}px`/);
  assert.match(source, /lineHeight: `\$\{META_LINE_HEIGHT\}px`/);
  assert.doesNotMatch(source, /META_GAP_RELAXED/);
});
