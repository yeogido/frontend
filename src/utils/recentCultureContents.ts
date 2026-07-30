import type { RecentCultureContent } from '../types/content.type';

export const RECENT_CULTURE_CONTENTS_STORAGE_KEY = 'recent-culture-contents';
export const MAX_RECENT_CULTURE_CONTENTS = 10;

export function upsertRecentCultureContent(
  contents: readonly RecentCultureContent[],
  content: RecentCultureContent,
): RecentCultureContent[] {
  return [
    content,
    ...contents.filter((item) => item.contentId !== content.contentId),
  ].slice(0, MAX_RECENT_CULTURE_CONTENTS);
}

export function getStoredRecentCultureContents(): RecentCultureContent[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedContents = window.localStorage.getItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY,
    );

    if (!storedContents) return [];

    const parsedContents: unknown = JSON.parse(storedContents);

    return Array.isArray(parsedContents)
      ? parsedContents.filter(isRecentCultureContent).slice(0, MAX_RECENT_CULTURE_CONTENTS)
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
      content,
    );

    window.localStorage.setItem(
      RECENT_CULTURE_CONTENTS_STORAGE_KEY,
      JSON.stringify(contents),
    );
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
