// GET /courses에 contentId 필터가 추가돼(이 행사를 포함한 코스만 걸러
// 서버가 직접 정렬), 이제 실제로 쓸 수 있는 정렬을 다 넣는다. 추천순만
// 제외했다 — courseType을 지정하지 않은(OFFICIAL+LOCAL 혼합) 목록에서는
// 추천순 정렬을 지원하지 않는다(COURSE4008).
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
    defaultLabel: '인기순',
    options: ['인기순', '전체', '최신순', '저장순', '후기순', '거리순'],
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
