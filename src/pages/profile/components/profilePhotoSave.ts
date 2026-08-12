interface PendingProfilePhotoState {
  readonly hasPendingPhoto: boolean;
  readonly isProcessingFile: boolean;
  readonly isUploading: boolean;
}

import { DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR } from '../../../components/common/defaultProfileAvatar';

export const PROFILE_PHOTO_BACKGROUND_COLOR =
  DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR;

export function canSavePendingProfilePhoto({
  hasPendingPhoto,
  isProcessingFile,
  isUploading,
}: PendingProfilePhotoState) {
  return hasPendingPhoto && !isProcessingFile && !isUploading;
}

export function shouldShowDefaultProfilePhoto({
  hasPhoto,
  isProcessingFile,
}: {
  hasPhoto: boolean;
  isProcessingFile: boolean;
}) {
  return !hasPhoto && !isProcessingFile;
}
