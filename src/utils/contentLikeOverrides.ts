// /contents 목록·검색 API 응답에는 isLiked 필드 자체가 없어(백엔드 제약),
// 페이지를 벗어났다 돌아오면 방금 누른 좋아요 상태를 되살릴 서버 진실값이
// 없다. 코스는 목록 응답에 isLiked가 있어 새로고침해도 정상 표시되지만,
// 콘텐츠(행사 등)는 이 로컬 저장소를 대신 참조해 좋아요 상태를 유지한다.
const CONTENT_LIKE_OVERRIDES_STORAGE_KEY = 'content-like-overrides';

export function getStoredContentLikeOverrides(): Record<number, boolean> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(
      CONTENT_LIKE_OVERRIDES_STORAGE_KEY,
    );

    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);

    return isContentLikeOverrideMap(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function setStoredContentLikeOverride(
  contentId: number,
  liked: boolean,
): void {
  if (typeof window === 'undefined') return;

  try {
    const overrides = getStoredContentLikeOverrides();

    overrides[contentId] = liked;

    window.localStorage.setItem(
      CONTENT_LIKE_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides),
    );
  } catch {
    return;
  }
}

function isContentLikeOverrideMap(
  value: unknown,
): value is Record<number, boolean> {
  if (typeof value !== 'object' || value === null) return false;

  return Object.values(value).every((liked) => typeof liked === 'boolean');
}
