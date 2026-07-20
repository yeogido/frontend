export const festivalSortOptions = [
  { label: '추천순', value: 'RECOMMENDED' },
  { label: '저장순', value: 'SAVED' },
  { label: '거리순', value: 'DISTANCE' },
  { label: '종료 임박순', value: 'ENDING_SOON' },
] as const;

export const festivalCategoryOptions = [
  { label: '전체', value: 'ALL' },
  { label: '체험', value: 'EXPERIENCE' },
  { label: '전시', value: 'EXHIBITION' },
  { label: '공연', value: 'PERFORMANCE' },
  { label: '축제', value: 'FESTIVAL' },
] as const;

export type FestivalSortOption = (typeof festivalSortOptions)[number];
export type FestivalSortValue = FestivalSortOption['value'];
export type FestivalCategoryOption = (typeof festivalCategoryOptions)[number];
export type FestivalCategoryValue = FestivalCategoryOption['value'];

export interface FestivalSelectedFilters {
  sort: FestivalSortValue;
  category: FestivalCategoryValue;
}

export const initialFestivalSelectedFilters: FestivalSelectedFilters = {
  sort: festivalSortOptions[0].value,
  category: festivalCategoryOptions[0].value,
};

export const getFestivalSortLabel = (value: FestivalSortValue) =>
  festivalSortOptions.find((option) => option.value === value)?.label ??
  festivalSortOptions[0].label;

export const getFestivalCategoryLabel = (value: FestivalCategoryValue) =>
  festivalCategoryOptions.find((option) => option.value === value)?.label ??
  festivalCategoryOptions[0].label;
