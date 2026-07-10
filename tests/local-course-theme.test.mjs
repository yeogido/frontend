import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const componentsDirectory = new URL(
  '../src/pages/local-course/components/',
  import.meta.url,
);

test('local course components use shared theme color tokens', async () => {
  const componentFiles = (await readdir(componentsDirectory)).filter((file) =>
    file.endsWith('.tsx'),
  );
  const sources = await Promise.all(
    componentFiles.map((file) =>
      readFile(new URL(file, componentsDirectory), 'utf8'),
    ),
  );
  const combinedSource = sources.join('\n');

  assert.doesNotMatch(combinedSource, /var\(--color-/);
  assert.doesNotMatch(combinedSource, /bg-\[#(?:e4e4e4|ffebe5)\]/i);

  for (const sharedToken of [
    'bg-main-2',
    'bg-main-5',
    'bg-gray-2',
    'text-black',
    'border-gray-2',
  ]) {
    assert.match(combinedSource, new RegExp(`\\b${sharedToken}\\b`));
  }
});
