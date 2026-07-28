import assert from 'node:assert/strict';
import test from 'node:test';

import { getVisibleFolderPhotos } from '../src/pages/travel-record/components/folderPhotos.ts';

test('keeps a single travel photo in only the first folder slot', () => {
  assert.deepEqual(getVisibleFolderPhotos(['first-photo']), ['first-photo']);
});

test('keeps at most two travel photos in folder slot order', () => {
  assert.deepEqual(
    getVisibleFolderPhotos(['first-photo', 'second-photo', 'third-photo']),
    ['first-photo', 'second-photo'],
  );
});
