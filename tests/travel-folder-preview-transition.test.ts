import assert from 'node:assert/strict';
import test from 'node:test';

import { getFolderPreviewPhotoIds } from '../src/pages/travel-record/photo-selection/folderPreviewPhotos.ts';

test('keeps each preview card identity while its selected order changes', () => {
  assert.deepEqual(
    getFolderPreviewPhotoIds([
      { id: 'second' },
      { id: 'first' },
      { id: 'third' },
    ]),
    ['second', 'first']
  );
});

test('uses only the photo cards displayed in the folder preview', () => {
  assert.deepEqual(
    getFolderPreviewPhotoIds([{ id: 'first' }, { id: 'second' }, { id: 'third' }]),
    ['first', 'second']
  );
});
