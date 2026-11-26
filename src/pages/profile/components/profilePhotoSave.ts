interface PendingProfilePhotoState {
  readonly hasPendingPhoto: boolean;
  readonly isProcessingFile: boolean;
  readonly isUploading: boolean;
}

import { DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR } from '../../../components/common/defaultProfileAvatar.ts';

export const PROFILE_PHOTO_BACKGROUND_COLOR =
  DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR;

export function canSavePendingProfilePhoto({
  hasPendingPhoto,
  isProcessingFile,
  isUploading,
}: PendingProfilePhotoState) {
  return hasPendingPhoto && !isProcessingFile && !isUploading;
}

/**
 * "삭제"를 골랐을 때의 저장 상태. PATCH /users/me는 profileImageUrl이 없으면
 * 기존 사진을 유지하므로, 서버에 저장된 사진을 지울 때만 빈 문자열을 보낸다.
 */
export function getProfilePhotoRemoval(hasSavedPhoto: boolean) {
  return {
    isPhotoChanged: hasSavedPhoto,
    profileImageKey: hasSavedPhoto ? '' : undefined,
  };
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
