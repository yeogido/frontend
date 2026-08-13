import type { LikedItemCategory } from '../types';

export const ALL_FILTER_OPTION = '전체';

/** 1번째 필터: 좋아요 항목 분류 */
export const LIKED_CATEGORY_OPTIONS = [
  ALL_FILTER_OPTION,
  '코스',
  '행사',
  '장소',
] as const;

/** 3번째 필터: 정렬 */
export const LIKED_SORT_OPTIONS = ['최신순', '오래된 순'] as const;

export const LIKED_SORT_LATEST = LIKED_SORT_OPTIONS[0];

export const likedCategoryByLabel: Record<
  string,
  LikedItemCategory | undefined
> = {
  코스: 'COURSE',
  행사: 'EVENT',
  장소: 'PLACE',
};

export type LikedItemFilterKey = 'category' | 'detail' | 'sort';

export type LikedItemSelectedFilters = Record<LikedItemFilterKey, string>;

export const initialLikedItemSelectedFilters: LikedItemSelectedFilters = {
  category: ALL_FILTER_OPTION,
  detail: ALL_FILTER_OPTION,
  sort: LIKED_SORT_LATEST,
};
