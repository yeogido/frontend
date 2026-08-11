// 백엔드에 "이 행사를 포함한 코스만" 걸러서 정렬까지 태울 수 있는 API가
// 아직 없어(코스 상세 응답 어디에도 좋아요 수·후기 수·저장 수·생성일이
// 없다), 클라이언트에서 계산 가능한 거리순만 우선 넣는다. 나머지
// 정렬(추천순/인기순/최신순/저장순/후기순)은 그 API가 생기면 다시 추가한다.
export const festivalCoursesFilterGroups = [
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
    defaultLabel: '전체',
    options: ['전체', '거리순'],
  },
] as const;

export type FestivalCoursesFilterKey =
  (typeof festivalCoursesFilterGroups)[number]['key'];

export type FestivalCoursesSelectedFilters = Record<
  FestivalCoursesFilterKey,
  string
>;

export const initialFestivalCoursesSelectedFilters =
  festivalCoursesFilterGroups.reduce((filters, filter) => {
    filters[filter.key] = filter.defaultLabel;
    return filters;
  }, {} as FestivalCoursesSelectedFilters);
