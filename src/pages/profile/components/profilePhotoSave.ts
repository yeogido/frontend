interface PendingProfilePhotoState {
  readonly hasPendingPhoto: boolean;
  readonly isProcessingFile: boolean;
  readonly isUploading: boolean;
}

export const PROFILE_PHOTO_BACKGROUND_COLOR = '#000000';

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
