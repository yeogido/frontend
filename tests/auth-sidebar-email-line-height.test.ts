import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('reserves a 16px line height for the sidebar profile email', async () => {
  const source = await readFile(
    new URL('../src/components/layout/AuthSidebar.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /lineHeight: `\$\{16 \* scale\}px`/);
});
