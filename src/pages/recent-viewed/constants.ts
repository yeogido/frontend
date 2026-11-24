export const RECENT_CATEGORY_OPTIONS = [
  '전체',
  '코스',
  '행사',
  '장소',
] as const;

export type RecentCategory = (typeof RECENT_CATEGORY_OPTIONS)[number];

export function isRecentCategory(
  value: string | null
): value is RecentCategory {
  return RECENT_CATEGORY_OPTIONS.some((option) => option === value);
}
