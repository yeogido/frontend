import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getFolderPhotoSlotIndexes,
  getVisibleFolderPhotos,
} from '../src/pages/travel-record/components/folderPhotos.ts';

test('puts a single travel photo in the right folder slot', () => {
  assert.deepEqual(getVisibleFolderPhotos(['first-photo']), ['first-photo']);
  assert.deepEqual(getFolderPhotoSlotIndexes(1), [1]);
});

test('keeps the cover photo in the right folder slot whatever the count', () => {
  assert.deepEqual(
    getVisibleFolderPhotos(['first-photo', 'second-photo', 'third-photo']),
    ['first-photo', 'second-photo'],
  );
  // 첫 사진이 대표 사진이므로 장수와 무관하게 오른쪽에 놓인다. 한 장일 때는
  // 오른쪽, 두 장일 때는 왼쪽으로 가던 모순을 없앤다.
  assert.deepEqual(getFolderPhotoSlotIndexes(2), [1, 0]);
  assert.equal(getFolderPhotoSlotIndexes(1)[0], getFolderPhotoSlotIndexes(2)[0]);
});

test('ignores empty travel photo fallback urls', () => {
  assert.deepEqual(getVisibleFolderPhotos(['', 'second-photo']), [
    'second-photo',
  ]);
});
