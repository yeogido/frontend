import type { MyPostCategory } from '../../../types/user.type';

export const MY_POST_CATEGORY_OPTIONS = [
  '전체',
  '코스',
  '후기',
  '홍보글',
] as const;

export const MY_POST_SORT_OPTIONS = ['최신순', '오래된 순'] as const;

export type MyPostFilterKey = 'category' | 'sort';

export type MyPostSelectedFilters = Record<MyPostFilterKey, string>;

export const initialMyPostSelectedFilters: MyPostSelectedFilters = {
  category: MY_POST_CATEGORY_OPTIONS[0],
  sort: MY_POST_SORT_OPTIONS[0],
};

export const myPostCategoryByLabel: Record<string, MyPostCategory> = {
  전체: 'ALL',
  코스: 'COURSE',
  후기: 'REVIEW',
  홍보글: 'PROMOTION',
};

export const myPostSortByLabel: Record<string, 'LATEST' | 'OLDEST'> = {
  최신순: 'LATEST',
  '오래된 순': 'OLDEST',
};
