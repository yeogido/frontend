import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canSavePendingProfilePhoto,
  PROFILE_PHOTO_BACKGROUND_COLOR,
  shouldShowDefaultProfilePhoto,
} from '../src/pages/profile/components/profilePhotoSave.ts';

test('allows profile save for a selected photo that is ready to upload', () => {
  assert.equal(
    canSavePendingProfilePhoto({
      hasPendingPhoto: true,
      isProcessingFile: false,
      isUploading: false,
    }),
    true
  );
});

test('blocks profile save while a selected photo is still processing or uploading', () => {
  assert.equal(
    canSavePendingProfilePhoto({
      hasPendingPhoto: true,
      isProcessingFile: true,
      isUploading: false,
    }),
    false
  );
  assert.equal(
    canSavePendingProfilePhoto({
      hasPendingPhoto: true,
      isProcessingFile: false,
      isUploading: true,
    }),
    false
  );
});

test('uses the saved profile photo background color when exporting a transparent image', () => {
  assert.equal(PROFILE_PHOTO_BACKGROUND_COLOR, '#E4E4E4');
});

test('hides the default profile icon while a newly selected photo is processing', () => {
  assert.equal(
    shouldShowDefaultProfilePhoto({ hasPhoto: false, isProcessingFile: true }),
    false
  );
  assert.equal(
    shouldShowDefaultProfilePhoto({ hasPhoto: false, isProcessingFile: false }),
    true
  );
});
