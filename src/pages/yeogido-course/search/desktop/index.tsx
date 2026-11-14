import { useCallback } from 'react';
import { MdChevronRight } from 'react-icons/md';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { DesktopPageShell } from '../../../../components/layout/desktop';
import { useCourseLikeToggle } from '../../../../hooks/useCourseLikeToggle';
import { useCourses } from '../../../../hooks/useCourses';
import { useDistanceSortCoordinates } from '../../../../hooks/useDistanceSortCoordinates';
import useInfiniteScroll from '../../../../hooks/useInfiniteScroll';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../../types/course.type';
import { toCourseCardProps } from '../../../../utils/courseCard';
import { getExplicitRegionId } from '../../../../utils/regionSearch';
import { buildCourseDetailPath } from '../../../../utils/routes';
import HomeCourseCard from '../../../home/desktop/HomeCourseCard';
import { useResolvedRegion } from '../../../region-info/hooks/useResolvedRegion';
import { yeogidoCourseFilterGroups } from '../../constants/filters';
import useYeogidoCourseFilters from '../../hooks/useYeogidoCourseFilters';
import { getCourseSearchConditions } from '../../utils/searchConditions';

// Figma 1440 데스크톱 시안(6364:46791 자연어 입력 결과) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const PAGE_SIZE = 20;

const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  자차: 'CAR',
};
const durationTypeByLabel: Record<string, CourseDurationType | undefined> = {
  당일치기: 'DAY_TRIP',
  '1박 2일': 'ONE_NIGHT',
  '2박 3일': 'TWO_NIGHT',
  '3박 이상': 'THREE_PLUS',
};
const companionTypeByLabel: Record<string, CourseCompanionType | undefined> = {
  혼자: 'SOLO',
  친구와: 'FRIEND',
  연인과: 'COUPLE',
  가족과: 'FAMILY',
  반려동물과: 'PET',
};
const sortByLabel: Record<string, CourseSort> = {
  추천순: 'RECOMMEND',
  인기순: 'POPULAR',
  최신순: 'LATEST',
  저장순: 'SAVED',
  후기순: 'REVIEW',
  거리순: 'DISTANCE',
};
const filterLabels = {
  transport: '이동 수단',
  duration: '여행 기간',
  companion: '동행',
  sort: '정렬',
};

/**
 * 데스크톱 여기도 코스 검색 결과 — 문장(keyword) 또는 지역(region·subRegion)으로
 * 찾은 코스를 보여준다. 문장 검색이면 서버가 뽑은 조건 칩으로 다시 검색한다.
 */
function YeogidoCourseSearchDesktopPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { selectedFilters, handleFilterSelect } = useYeogidoCourseFilters();
  const { coordinates, status, requestCoordinates } =
    useDistanceSortCoordinates();

  const keyword = searchParams.get('keyword') ?? '';
  const region = searchParams.get('region') ?? '';
  const subRegion = searchParams.get('subRegion') ?? '';
  const explicitRegionId = getExplicitRegionId(searchParams.get('regionId'));
  const regionSearchQuery =
    region && subRegion ? `${region} ${subRegion}` : subRegion || region;
  const displayQuery = keyword.trim() || regionSearchQuery;
  const isDistanceSort = selectedFilters.sort === '거리순';

  const {
    regionId,
    isPending: isRegionPending,
    isError: isRegionError,
  } = useResolvedRegion(regionSearchQuery || undefined, explicitRegionId);
  const isRegionSearchReady =
    !regionSearchQuery || (!isRegionPending && !isRegionError);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending: isCoursesPending,
    refetch,
  } = useCourses(
    {
      courseType: 'OFFICIAL',
      keyword: keyword.trim() || undefined,
      regionId,
      transportType: transportTypeByLabel[selectedFilters.transport],
      durationType: durationTypeByLabel[selectedFilters.duration],
      companionType: companionTypeByLabel[selectedFilters.companion],
      sort: sortByLabel[selectedFilters.sort],
      latitude: isDistanceSort ? coordinates?.latitude : undefined,
      longitude: isDistanceSort ? coordinates?.longitude : undefined,
      size: PAGE_SIZE,
    },
    {
      enabled:
        isRegionSearchReady &&
        (!isDistanceSort || status === 'ready' || status === 'failed'),
    }
  );
  // 지역 해석이 실패하면 쿼리는 비활성인 채 pending으로 남으므로 덮어쓴다.
  const isPending = !isRegionError && isCoursesPending;
  const courses = (data?.pages.flatMap((page) => page.items) ?? []).map(
    toCourseCardProps
  );
  const conditions = getCourseSearchConditions(data?.pages, keyword.trim());

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending && !isError,
    onIntersect: handleIntersect,
  });

  // 조건 칩을 누르면 그 조건을 새 검색어로 삼는다(지역 파라미터는 지운다).
  const searchByCondition = (condition: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('keyword', condition);
    next.delete('region');
    next.delete('subRegion');
    next.delete('regionId');
    setSearchParams(next);
  };

  const hasEmptyResult =
    !isRegionPending &&
    !isPending &&
    !isError &&
    !isRegionError &&
    courses.length === 0;

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div className="flex flex-col gap-[48px]">
        <header className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] font-semibold text-black">
            {displayQuery ? `“${displayQuery}” 검색 결과` : '코스 검색 결과'}
          </h1>
          {conditions.length > 0 ? (
            <>
              <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
                원하는 조건으로 더 많은 코스를 찾아보세요
              </p>
              <ul className="mt-[8px] flex flex-wrap gap-[8px]">
                {conditions.map((condition) => (
                  <li key={condition}>
                    <button
                      type="button"
                      aria-label={`${condition} 조건으로 다시 검색`}
                      onClick={() => searchByCondition(condition)}
                      className="border-main-5 bg-main-1 text-main-5 flex items-center rounded-full border py-[4px] pr-[8px] pl-[12px] text-[14px] font-medium"
                    >
                      {condition}
                      <MdChevronRight
                        aria-hidden="true"
                        className="text-[18px]"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </header>

        <section className="flex flex-col gap-[24px]">
          <h2 className="text-[24px] font-semibold text-black">
            {displayQuery ? `“${displayQuery}” 코스` : '코스'}
          </h2>

          <div className="flex items-start gap-[16px]">
            {yeogidoCourseFilterGroups.map((group) => (
              <label
                key={group.key}
                className={group.key === 'sort' ? 'ml-auto' : ''}
              >
                <span className="sr-only">{filterLabels[group.key]}</span>
                <select
                  value={selectedFilters[group.key]}
                  onChange={(event) => {
                    const value = event.target.value;
                    handleFilterSelect(group.key, value);
                    if (group.key === 'sort' && value === '거리순') {
                      void requestCoordinates();
                    }
                  }}
                  className="border-gray-2 text-gray-4 h-[37px] cursor-pointer rounded-full border bg-white px-[10px] text-[18px]"
                >
                  {group.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {isPending ? (
            <p className="text-gray-4 py-[48px] text-center">
              코스를 불러오는 중이에요.
            </p>
          ) : null}
          {isRegionError ? (
            <p role="alert" className="text-main-5 py-[48px] text-center">
              지역 정보를 찾지 못했어요.
            </p>
          ) : null}
          {isError ? (
            <div className="py-[48px] text-center">
              <p className="text-main-5">검색 결과를 불러오지 못했어요.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="border-gray-2 mt-[16px] rounded-full border px-[16px] py-[8px]"
              >
                다시 시도
              </button>
            </div>
          ) : null}
          {hasEmptyResult ? (
            <p className="text-gray-4 py-[48px] text-center">
              검색 결과가 없어요.
            </p>
          ) : null}

          <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
            {courses.map((course) => (
              <HomeCourseCard
                key={course.id}
                image={course.image}
                title={course.title}
                duration={course.duration}
                courseType={course.courseType}
                companion={course.companion}
                tags={course.tags}
                liked={getLiked(course.id, course.liked)}
                onClick={() =>
                  navigate(buildCourseDetailPath('OFFICIAL', course.id))
                }
                onLikeClick={() =>
                  toggleLike(course.id, getLiked(course.id, course.liked))
                }
              />
            ))}
          </div>

          {isFetchingNextPage ? (
            <p className="text-gray-4 text-center">
              코스를 더 불러오는 중이에요.
            </p>
          ) : null}
          <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
        </section>
      </div>
    </DesktopPageShell>
  );
}

export default YeogidoCourseSearchDesktopPage;
