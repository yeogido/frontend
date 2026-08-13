import type { RecentCultureContent } from '../types/content.type';
import { useAuthStore } from '../store/auth.store.ts';

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

function getStorageKey(): string {
  const userId = useAuthStore.getState().userId;

  return userId === null
    ? RECENT_CULTURE_CONTENTS_STORAGE_KEY
    : `${RECENT_CULTURE_CONTENTS_STORAGE_KEY}:${userId}`;
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

// 저장된 그대로(날짜 변환 없이) 읽는다. 읽고 다시 쓰는(read-modify-write)
// 함수들은 반드시 이 원본을 써야 한다 — 표시용으로 잘라낸 날짜를 그대로
// 저장소에 되돌려 쓰면 원래 저장돼 있던 일자 단위 정보가 사라진다.
function getStoredRecentCultureContentsRaw(): RecentCultureContent[] {
  if (typeof window === 'undefined') return [];

  try {
    const storageKey = getStorageKey();
    const storedContents =
      window.localStorage.getItem(storageKey) ??
      (storageKey === RECENT_CULTURE_CONTENTS_STORAGE_KEY
        ? null
        : window.localStorage.getItem(RECENT_CULTURE_CONTENTS_STORAGE_KEY));

    if (!storedContents) return [];

    const parsedContents: unknown = JSON.parse(storedContents);

    const contents = Array.isArray(parsedContents)
      ? parsedContents
          .flatMap(toRecentCultureContent)
          .slice(0, MAX_RECENT_CULTURE_CONTENTS)
      : [];

    if (contents.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(contents));
    }

    return contents;
  } catch {
    return [];
  }
}

export function getStoredRecentCultureContents(): RecentCultureContent[] {
  return getStoredRecentCultureContentsRaw().map((content) => ({
    ...content,
    startDate: toYearMonthLabel(content.startDate),
    endDate: toYearMonthLabel(content.endDate),
  }));
}

export function saveRecentCultureContent(content: RecentCultureContent): void {
  if (typeof window === 'undefined') return;

  try {
    const contents = upsertRecentCultureContent(
      getStoredRecentCultureContentsRaw(),
      content
    );

    window.localStorage.setItem(
      getStorageKey(),
      JSON.stringify(contents)
    );
    notifyRecentCultureContentsUpdated();
  } catch {
    return;
  }
}

/**
 * `recent-culture-contents`와 `recent-culture-contents:{userId}` 형태의 키를
 * 모두 모은다.
 */
function getAllRecentCultureContentStorageKeys(): string[] {
  const keys: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (
      key === RECENT_CULTURE_CONTENTS_STORAGE_KEY ||
      key?.startsWith(`${RECENT_CULTURE_CONTENTS_STORAGE_KEY}:`)
    ) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * 삭제된 행사는 계정을 가리지 않고 목록에서 빠져야 한다. 이유는
 * recentCourses.ts의 removeRecentCourse 주석 참고.
 */
export function removeRecentCultureContent(contentId: number): void {
  if (typeof window === 'undefined') return;

  try {
    let hasRemoved = false;

    for (const key of getAllRecentCultureContentStorageKeys()) {
      const storedContents = window.localStorage.getItem(key);

      if (!storedContents) continue;

      const parsedContents: unknown = JSON.parse(storedContents);

      if (!Array.isArray(parsedContents)) continue;

      const remainingContents = parsedContents.filter(
        (content) =>
          (content as { contentId?: unknown } | null)?.contentId !== contentId
      );

      if (remainingContents.length === parsedContents.length) continue;

      window.localStorage.setItem(key, JSON.stringify(remainingContents));
      hasRemoved = true;
    }

    if (hasRemoved) {
      notifyRecentCultureContentsUpdated();
    }
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
    const contents = getStoredRecentCultureContentsRaw();

    if (!contents.some((content) => content.contentId === contentId)) return;

    const updatedContents = contents.map((content) =>
      content.contentId === contentId ? { ...content, liked } : content
    );

    window.localStorage.setItem(
      getStorageKey(),
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
    const contents = getStoredRecentCultureContentsRaw();

    if (!contents.some((content) => content.liked)) return;

    const updatedContents = contents.map((content) => ({
      ...content,
      liked: false,
    }));

    window.localStorage.setItem(
      getStorageKey(),
      JSON.stringify(updatedContents)
    );
    notifyRecentCultureContentsUpdated();
  } catch {
    return;
  }
}

function toRecentCultureContent(value: unknown): RecentCultureContent[] {
  if (!isRecentCultureContent(value)) return [];

  const content = { ...(value as RecentCultureContent) } as Record<
    string,
    unknown
  >;
  delete content.canManage;

  return [content as unknown as RecentCultureContent];
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
