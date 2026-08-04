import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getFolderPhotoSlotIndexes,
  getVisibleFolderPhotos,
} from '../src/pages/travel-record/components/folderPhotos.ts';
import { getFolderPreviewPhotoUrls } from '../src/pages/travel-record/photo-selection/folderPreviewPhotos.ts';

import type { SelectedPhoto } from '../src/pages/travel-record/photo-selection/types.ts';

const createSelectedPhoto = (id: string): SelectedPhoto => ({
  id,
  source: 'new',
  file: { name: id } as File,
  url: `blob:${id}`,
});

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

test('follows the selected photo order in the folder preview', () => {
  const first = createSelectedPhoto('first');
  const second = createSelectedPhoto('second');
  const third = createSelectedPhoto('third');

  assert.deepEqual(getFolderPreviewPhotoUrls([first, second, third]), [
    'blob:first',
    'blob:second',
  ]);
  // 목록에서 순서를 바꾸면 미리보기에 보이는 사진도 함께 바뀐다.
  assert.deepEqual(getFolderPreviewPhotoUrls([third, first, second]), [
    'blob:third',
    'blob:first',
  ]);
});

test('shows nothing in the folder preview until a photo is selected', () => {
  assert.deepEqual(getFolderPreviewPhotoUrls([]), []);
});
