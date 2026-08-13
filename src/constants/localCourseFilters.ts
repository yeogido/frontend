export const localCourseFilterGroups = [
  {
    key: 'transport',
    defaultLabel: '전체',
    options: ['전체', '도보', '자차'],
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
  // 우리동네 코스는 추천순 정렬을 지원하지 않는다.
  {
    key: 'sort',
    defaultLabel: '인기순',
    options: ['인기순', '최신순', '저장순', '후기순', '거리순'],
  },
] as const;

export type LocalCourseFilterKey =
  (typeof localCourseFilterGroups)[number]['key'];

export type LocalCourseSelectedFilters = Record<
  LocalCourseFilterKey,
  string
>;

export const initialLocalCourseSelectedFilters =
  localCourseFilterGroups.reduce((filters, filter) => {
    filters[filter.key] = filter.defaultLabel;
    return filters;
  }, {} as LocalCourseSelectedFilters);
