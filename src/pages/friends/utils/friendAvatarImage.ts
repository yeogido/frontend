// 주소가 없거나 공백뿐이면 사진이 없는 친구로 본다.
export function getFriendAvatarImageSrc(
  url: string | null | undefined
): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  return url.trim() || null;
}
