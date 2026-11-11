import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COVER_PHOTO_ACCEPT,
  isSupportedCoverPhoto,
} from '../src/pages/local-recommendation/tag-selection/coverPhotoFile.ts';

const fileOfType = (type: string) => ({ type }) as File;

test('accepts the image types the upload endpoint takes', () => {
  assert.equal(isSupportedCoverPhoto(fileOfType('image/jpeg')), true);
  assert.equal(isSupportedCoverPhoto(fileOfType('image/png')), true);
  assert.equal(isSupportedCoverPhoto(fileOfType('image/webp')), true);
});

test('rejects image types the upload endpoint refuses', () => {
  // HEIC는 브라우저가 image/*로 통과시키지만 presigned-url 발급에서 거부된다.
  assert.equal(isSupportedCoverPhoto(fileOfType('image/heic')), false);
  assert.equal(isSupportedCoverPhoto(fileOfType('image/gif')), false);
  assert.equal(isSupportedCoverPhoto(fileOfType('application/pdf')), false);
  assert.equal(isSupportedCoverPhoto(fileOfType('')), false);
});

test('keeps the file picker filter in step with the check', () => {
  COVER_PHOTO_ACCEPT.split(',').forEach((type) => {
    assert.equal(isSupportedCoverPhoto(fileOfType(type)), true);
  });
});
