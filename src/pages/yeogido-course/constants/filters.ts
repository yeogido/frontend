export const yeogidoCourseFilterGroups = [
  {
    key: 'transport',
    defaultLabel: '전체',
    options: ['전체', '도보', '대중교통', '자차'],
  },
  {
    key: 'duration',
    defaultLabel: '전체',
    options: ['전체', '당일치기', '1박 2일', '2박 3일', '3박 이상'],
  },
  {
    key: 'companion',
    defaultLabel: '전체',
    options: ['전체', '혼자', '친구와', '연인과', '가족과', '반려동물과'],
  },
  {
    key: 'sort',
    defaultLabel: '추천순',
    options: ['추천순', '인기순', '최신순', '저장순', '후기순', '거리순'],
  },
] as const;

export type YeogidoCourseFilterKey =
  (typeof yeogidoCourseFilterGroups)[number]['key'];

export type YeogidoCourseSelectedFilters = Record<
  YeogidoCourseFilterKey,
  string
>;

export const initialYeogidoCourseSelectedFilters =
  yeogidoCourseFilterGroups.reduce((filters, filter) => {
    filters[filter.key] = filter.defaultLabel;
    return filters;
  }, {} as YeogidoCourseSelectedFilters);
