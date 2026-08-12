export function getReviewerAvatarSource({
  reviewImageUrl,
  isMine = false,
  currentProfileImageUrl,
}: {
  reviewImageUrl?: string | null;
  isMine?: boolean;
  currentProfileImageUrl?: string | null;
}) {
  return isMine && currentProfileImageUrl
    ? currentProfileImageUrl
    : reviewImageUrl ?? '';
}
