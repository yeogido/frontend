import { useCallback, useEffect, useRef } from 'react';
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
import useSearchConditionCourses from '../../hooks/useSearchConditionCourses';
import useYeogidoCourseFilters from '../../hooks/useYeogidoCourseFilters';

// Figma 1440 데스크톱 시안(6364:46791 자연어 입력 결과) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const PAGE_SIZE = 20;

const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  자동차: 'CAR',
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
 * 찾은 코스를 보여준다. 문장 검색이면 서버가 뽑은 조건 칩으로 코스를 더 찾아
 * 결과 아래에 이어 보여준다.
 */
function YeogidoCourseSearchDesktopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    isFetching,
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
  const conditionSearch = useSearchConditionCourses({
    firstSearchPages: data?.pages,
    keyword: keyword.trim(),
    refetchFirstSearch: refetch,
  });
  const { conditions, selectedCondition } = conditionSearch;
  const conditionCourses = conditionSearch.courses.map(toCourseCardProps);
  const shouldShowConditionCourses =
    Boolean(selectedCondition) && !isPending && !isError;
  const hasEmptyConditionCourses =
    shouldShowConditionCourses &&
    !conditionSearch.isPending &&
    !conditionSearch.isError &&
    conditionCourses.length === 0;

  /**
   * 목록 끝이 보이면 다음 페이지를 불러온다. 갱신(만료된 searchId 복구 등)
   * 중에 다음 페이지를 요청하면 그 갱신이 취소되므로, 아무 요청도 진행 중이지
   * 않을 때만 받는다.
   */
  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetching) void fetchNextPage();
  }, [hasNextPage, isFetching, fetchNextPage]);
  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending && !isError,
    onIntersect: handleIntersect,
  });

  const {
    hasNextPage: hasNextConditionPage,
    isFetchingNextPage: isFetchingNextConditionPage,
    fetchNextPage: fetchNextConditionPage,
  } = conditionSearch;

  /** 조건 칩으로 더 찾은 목록의 끝이 보이면 다음 페이지를 불러온다. */
  const handleConditionIntersect = useCallback(() => {
    if (hasNextConditionPage && !isFetchingNextConditionPage) {
      void fetchNextConditionPage();
    }
  }, [
    hasNextConditionPage,
    isFetchingNextConditionPage,
    fetchNextConditionPage,
  ]);
  // 첫 결과를 끝까지 받은 뒤에만 이어 붙인 목록을 더 불러온다.
  const loadMoreConditionRef = useInfiniteScroll({
    enabled:
      shouldShowConditionCourses &&
      !hasNextPage &&
      Boolean(hasNextConditionPage) &&
      !conditionSearch.isPending &&
      // 실패한 뒤 감지 요소가 다시 알려도 같은 페이지를 반복 요청하지 않는다.
      // 재시도는 '다시 시도' 버튼으로 한다.
      !conditionSearch.isError,
    onIntersect: handleConditionIntersect,
  });

  // 칩은 페이지 위쪽에 있고 더 찾은 코스는 결과 아래에 붙으므로, 칩을 새로
  // 고르면 그 목록으로 스크롤한다.
  const conditionSectionRef = useRef<HTMLElement | null>(null);
  const shouldScrollToConditionRef = useRef(false);

  /** 조건 칩을 누르면 그 조건으로 코스를 더 찾고, 다시 누르면 선택을 푼다. */
  const handleConditionSelect = (condition: string) => {
    shouldScrollToConditionRef.current = condition !== selectedCondition;
    conditionSearch.selectCondition(condition);
  };

  useEffect(() => {
    if (!selectedCondition || !shouldScrollToConditionRef.current) return;

    shouldScrollToConditionRef.current = false;
    conditionSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [selectedCondition]);

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
                      aria-label={`${condition} 조건으로 코스 더 보기`}
                      aria-pressed={condition === selectedCondition}
                      onClick={() => handleConditionSelect(condition)}
                      className={`border-main-5 flex items-center rounded-full border py-[4px] pr-[8px] pl-[12px] text-[14px] font-medium ${
                        condition === selectedCondition
                          ? 'bg-main-5 text-white'
                          : 'bg-main-1 text-main-5'
                      }`}
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

        {shouldShowConditionCourses ? (
          <section
            ref={conditionSectionRef}
            className="flex scroll-mt-[24px] flex-col gap-[24px]"
          >
            <h2 className="text-[24px] font-semibold text-black">
              {`“${selectedCondition}” 조건으로 더 찾은 코스`}
            </h2>

            {conditionSearch.isPending ? (
              <p className="text-gray-4 py-[48px] text-center">
                코스를 불러오는 중이에요.
              </p>
            ) : null}
            {conditionSearch.isError ? (
              <div className="py-[48px] text-center">
                <p className="text-main-5">코스를 더 불러오지 못했어요.</p>
                <button
                  type="button"
                  onClick={conditionSearch.refetch}
                  className="border-gray-2 mt-[16px] rounded-full border px-[16px] py-[8px]"
                >
                  다시 시도
                </button>
              </div>
            ) : null}
            {hasEmptyConditionCourses ? (
              <p className="text-gray-4 py-[48px] text-center">
                이 조건으로 더 찾은 코스가 없어요.
              </p>
            ) : null}

            <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
              {conditionCourses.map((course) => (
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

            {isFetchingNextConditionPage ? (
              <p className="text-gray-4 text-center">
                코스를 더 불러오는 중이에요.
              </p>
            ) : null}
            <div
              ref={loadMoreConditionRef}
              className="h-[40px]"
              aria-hidden="true"
            />
          </section>
        ) : null}
      </div>
    </DesktopPageShell>
  );
}

export default YeogidoCourseSearchDesktopPage;
