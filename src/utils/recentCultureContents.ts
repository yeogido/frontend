import type { RecentCultureContent } from '../types/content.type';

export const RECENT_CULTURE_CONTENTS_STORAGE_KEY = 'recent-culture-contents';
export const MAX_RECENT_CULTURE_CONTENTS = 10;
// useRecentCultureContents는 마운트 시 한 번만 localStorage를 읽어(리액트
// state), 다른 곳에서 목록을 바꿔도 이미 그려진 화면에는 반영되지 않는다.
// 같은 탭 안에서 즉시 갱신되도록 변경할 때마다 이 이벤트를 쏘고, 훅이
// 구독해서 다시 읽는다.
export const RECENT_CULTURE_CONTENTS_UPDATED_EVENT =
  'recent-culture-contents-updated';

function notifyRecentCultureContentsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(RECENT_CULTURE_CONTENTS_UPDATED_EVENT));
}

export function upsertRecentCultureContent(
  contents: readonly RecentCultureContent[],
  content: RecentCultureContent
): RecentCultureContent[] {
  return [
    content,
    ...contents.filter((item) => item.contentId !== content.contentId),
  ].slice(0, MAX_RECENT_CULTURE_CONTENTS);
}

// 목록 조회 API(/contents)는 응답의 startDate/endDate를 "YYYY.MM"(월까지)로
// 내려주도록 바뀌었지만, 상세 조회(/contents/{id})는 여전히 일자까지 내려준다.
// "최근 본 행사"는 상세 페이지 방문 시점에 저장한 값을 그대로 쓰므로, 카드에
// 보여줄 때는 다른 카드들과 형식을 맞추기 위해 월까지만 잘라 보여준다.
function toYearMonthLabel(date: string): string {
  const match = date.match(/^(\d{4})[-./](\d{2})/);

  return match ? `${match[1]}.${match[2]}` : date;
}

export function getStoredRecentCultureContents(): RecentCultureContent[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedContents = window.localStorage.getItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY
    );

    if (!storedContents) return [];

    const parsedContents: unknown = JSON.parse(storedContents);

    return Array.isArray(parsedContents)
      ? parsedContents
          .filter(isRecentCultureContent)
          .slice(0, MAX_RECENT_CULTURE_CONTENTS)
          .map((content) => ({
            ...content,
            startDate: toYearMonthLabel(content.startDate),
            endDate: toYearMonthLabel(content.endDate),
          }))
      : [];
  } catch {
    return [];
  }
}

export function saveRecentCultureContent(content: RecentCultureContent): void {
  if (typeof window === 'undefined') return;

  try {
    const contents = upsertRecentCultureContent(
      getStoredRecentCultureContents(),
      content
    );

    window.localStorage.setItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY,
      JSON.stringify(contents)
    );
    notifyRecentCultureContentsUpdated();
  } catch {
    return;
  }
}

export function removeRecentCultureContent(contentId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const contents = getStoredRecentCultureContents();

    if (!contents.some((content) => content.contentId === contentId)) return;

    const updatedContents = contents.filter(
      (content) => content.contentId !== contentId
    );

    window.localStorage.setItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY,
      JSON.stringify(updatedContents)
    );
    notifyRecentCultureContentsUpdated();
  } catch {
    return;
  }
}

export function updateRecentCultureContentLikeState(
  contentId: number,
  liked: boolean
): void {
  if (typeof window === 'undefined') return;

  try {
    const contents = getStoredRecentCultureContents();

    if (!contents.some((content) => content.contentId === contentId)) return;

    const updatedContents = contents.map((content) =>
      content.contentId === contentId ? { ...content, liked } : content
    );

    window.localStorage.setItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY,
      JSON.stringify(updatedContents)
    );
    notifyRecentCultureContentsUpdated();
  } catch {
    return;
  }
}

// 비로그인 상태에서는 좋아요를 가질 수 없으므로, 로그아웃 시 "최근 본
// 행사" 목록은 그대로 두고 각 항목의 좋아요 표시만 지운다.
export function clearRecentCultureContentsLikedState(): void {
  if (typeof window === 'undefined') return;

  try {
    const contents = getStoredRecentCultureContents();

    if (!contents.some((content) => content.liked)) return;

    const updatedContents = contents.map((content) => ({
      ...content,
      liked: false,
    }));

    window.localStorage.setItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY,
      JSON.stringify(updatedContents)
    );
    notifyRecentCultureContentsUpdated();
  } catch {
    return;
  }
}

function isRecentCultureContent(value: unknown): value is RecentCultureContent {
  if (typeof value !== 'object' || value === null) return false;

  const content = value as Record<string, unknown>;

  return (
    typeof content.contentId === 'number' &&
    typeof content.title === 'string' &&
    typeof content.thumbnailImageUrl === 'string' &&
    typeof content.regionName === 'string' &&
    Array.isArray(content.hashtags) &&
    content.hashtags.every((hashtag) => typeof hashtag === 'string') &&
    typeof content.startDate === 'string' &&
    typeof content.endDate === 'string' &&
    typeof content.liked === 'boolean'
  );
}
