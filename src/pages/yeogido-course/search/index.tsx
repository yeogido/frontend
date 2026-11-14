import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseDeleteDialog,
  CourseFilterBar,
  EditableContentCard,
  SearchBar,
} from '../../../components/common';
import { COURSE_REGION_RECENT_SEARCH_STORAGE_KEY } from '../../../constants/recentSearches';
import { isExtendedTransportFilterLabel } from '../../../constants/courseFilterLayout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCourseDelete, useCourses } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditCourse } from '../../../hooks/useEditCourse';
import { useResolvedRegion } from '../../region-info/hooks/useResolvedRegion';
import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  removeStoredRecentSearch,
} from '../../../utils/recentSearches';
import { toContentTagIds } from '../../../utils/contentTags';
import { getExplicitRegionId } from '../../../utils/regionSearch';
import {
  toCompanionLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';

import SearchConditionChips from '../components/SearchConditionChips';
import { yeogidoCourseFilterGroups } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useSearchConditionCourses from '../hooks/useSearchConditionCourses';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';
import { SEARCH_CONDITION_PARAM } from '../utils/searchConditions';
import type {
  Course,
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../types/course.type';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const SEARCH_BAR_MARGIN_TOP = 12;
const FILTER_MARGIN_TOP = 12;
const SEARCH_CONDITIONS_MARGIN_TOP = 32;
const CONDITION_COURSES_MARGIN_TOP = 16;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const recentSearchStorageOptions = {
  storageKey: COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
};

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

const durationLabelByType: Record<CourseDurationType, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  TWO_NIGHT: '2박 3일',
  THREE_PLUS: '3박 이상',
};

/**
 * 여기도 코스 검색 결과 페이지. URL의 keyword(문장 검색) 또는 region·subRegion
 * (지역 검색)과 필터로 코스를 찾아 무한 스크롤로 보여준다. 문장으로 검색하면
 * 문장을 제목으로 띄우고, 서버가 문장에서 뽑은 조건을 하단 칩으로 보여준다.
 */
function YeogidoCourseSearchPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  /** 코스 카드를 누르면 해당 코스 상세로 이동한다. */
  const handleCourseClick = (courseId: number | string) => {
    navigate(`/yeogido-course/detail/${courseId}`);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [recentSearchSuggestions, setRecentSearchSuggestions] = useState(
    () => getStoredRecentSearches(recentSearchStorageOptions)
  );
  const keyword = searchParams.get('keyword') ?? '';
  const region = searchParams.get('region') ?? '';
  const subRegion = searchParams.get('subRegion') ?? '';
  const explicitRegionId = getExplicitRegionId(searchParams.get('regionId'));
  const regionSearchQuery =
    region && subRegion ? `${region} ${subRegion}` : subRegion || region;
  const displaySearchQuery = keyword || regionSearchQuery;
  const {
    regionId,
    isPending: isRegionPending,
    isError: isRegionError,
  } = useResolvedRegion(regionSearchQuery || undefined, explicitRegionId);
  const isRegionSearchReady =
    !regionSearchQuery || (!isRegionPending && !isRegionError);

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useYeogidoCourseFilters();

  const isDistanceSort = selectedFilters.sort === '거리순';
  const {
    coordinates: distanceSortCoordinates,
    status,
    requestCoordinates,
  } = useDistanceSortCoordinates();

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
      latitude: isDistanceSort ? distanceSortCoordinates?.latitude : undefined,
      longitude: isDistanceSort
        ? distanceSortCoordinates?.longitude
        : undefined,
      size: 20,
    },
    {
      enabled:
        isRegionSearchReady &&
        (!isDistanceSort || status === 'ready' || status === 'failed'),
    }
  );

  // 지역 해석이 실패하면 useCourses는 enabled:false로 남는데, 비활성 쿼리는
  // status가 'pending'에서 갱신되지 않는다. 그대로 두면 에러 문구 아래로
  // 스켈레톤이 영원히 돌고 '검색 결과 없음'도 뜨지 못하므로 여기서 덮어쓴다.
  const isPending = !isRegionError && isCoursesPending;

  const yeogidoCourses = data?.pages.flatMap((page) => page.items) ?? [];
  // 검색어(문장)로 찾았을 때는 그 문장을 제목으로 보여준다. 서버는 문장에서
  // 지역·기간·동행 등을 직접 해석해 결과에 적용하고, 해석한 조건을
  // extractedKeywords로 돌려준다 — 하단 칩은 그중 하나로 코스를 더 찾는다.
  const searchTitle = keyword.trim();
  const conditionSearch = useSearchConditionCourses({
    firstSearchPages: data?.pages,
    keyword: searchTitle,
    refetchFirstSearch: refetch,
  });
  // 다음 페이지를 다 받은 뒤(목록 끝)에만 띄워야 무한 스크롤 중에 목록
  // 사이에 끼었다가 밀려나지 않는다.
  const shouldShowSearchConditions =
    Boolean(searchTitle) &&
    !isPending &&
    !isError &&
    !hasNextPage &&
    conditionSearch.conditions.length > 0;
  const shouldShowConditionCourses =
    shouldShowSearchConditions && Boolean(conditionSearch.selectedCondition);
  const hasEmptyConditionCourses =
    shouldShowConditionCourses &&
    !conditionSearch.isPending &&
    !conditionSearch.isError &&
    conditionSearch.courses.length === 0;
  const hasEmptyResult =
    !isRegionPending &&
    !isPending &&
    !isError &&
    !isRegionError &&
    yeogidoCourses.length === 0;

  /** 목록 끝이 보이면 다음 페이지를 불러온다(이미 불러오는 중이면 건너뛴다). */
  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
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
      fetchNextConditionPage();
    }
  }, [
    fetchNextConditionPage,
    hasNextConditionPage,
    isFetchingNextConditionPage,
  ]);

  const loadMoreConditionRef = useInfiniteScroll({
    enabled:
      shouldShowConditionCourses &&
      Boolean(hasNextConditionPage) &&
      !conditionSearch.isPending,
    onIntersect: handleConditionIntersect,
  });

  /**
   * 검색어로 다시 검색한다. 지역 검색 파라미터와 선택한 조건 칩은 지우고
   * 필터는 그대로 두며, 검색어를 최근 검색어에 추가한다. 빈 검색어면 검색
   * 조건만 비운다.
   */
  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete(SEARCH_CONDITION_PARAM);

    if (trimmedQuery) {
      nextSearchParams.set('keyword', trimmedQuery);
      nextSearchParams.delete('region');
      nextSearchParams.delete('subRegion');
      nextSearchParams.delete('regionId');
      setRecentSearchSuggestions(
        addStoredRecentSearch(trimmedQuery, {
          ...recentSearchStorageOptions,
          currentSearches: recentSearchSuggestions,
        })
      );
    } else {
      nextSearchParams.delete('keyword');
      nextSearchParams.delete('region');
      nextSearchParams.delete('subRegion');
      nextSearchParams.delete('regionId');
    }

    setSearchParams(nextSearchParams);
  };

  /** 코스 카드 하나 — 관리 권한이 있으면 수정·삭제 카드, 아니면 좋아요 카드. */
  const renderCourseCard = (course: Course) =>
    course.canManage ? (
      <EditableContentCard
        key={course.courseId}
        image={course.routeImageUrl?.trim() || course.thumbnailUrl}
        title={course.title}
        firstInfo={durationLabelByType[course.durationType]}
        secondInfo={toTransportLabel(course.transportType)}
        thirdInfo={toCompanionLabel(course.companionType)}
        tags={toContentTagIds(course.tags)}
        className="w-full"
        onClick={() => handleCourseClick(course.courseId)}
        onEdit={() => void editCourse(course.courseId)}
        onDelete={() => requestDelete(course.courseId)}
      />
    ) : (
      <ContentCard
        key={course.courseId}
        image={course.routeImageUrl?.trim() || course.thumbnailUrl}
        title={course.title}
        firstInfo={durationLabelByType[course.durationType]}
        secondInfo={toTransportLabel(course.transportType)}
        thirdInfo={toCompanionLabel(course.companionType)}
        tags={toContentTagIds(course.tags)}
        liked={getLiked(course.courseId, course.isLiked)}
        className="w-full"
        onClick={() => handleCourseClick(course.courseId)}
        onLikeClick={() =>
          toggleLike(course.courseId, getLiked(course.courseId, course.isLiked))
        }
      />
    );

  /** 최근 검색어 목록에서 하나를 지운다. */
  const handleRemoveRecentSearchSuggestion = (suggestion: string) => {
    setRecentSearchSuggestions(
      removeStoredRecentSearch(suggestion, {
        ...recentSearchStorageOptions,
        currentSearches: recentSearchSuggestions,
      })
    );
  };

  return (
    <>
      <section
        className="mx-auto flex min-h-screen w-full flex-col"
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
          paddingTop: PAGE_PADDING_TOP * scale,
          paddingBottom: PAGE_PADDING_BOTTOM * scale,
        }}
      >
        <div className="w-full">
          {searchTitle ? (
            <h1
              className="font-semibold break-keep text-black"
              style={{
                fontSize: TITLE_SIZE * scale,
                lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
                marginBottom: SEARCH_BAR_MARGIN_TOP * scale,
              }}
            >
              {searchTitle}
            </h1>
          ) : null}
          <SearchBar
            initialQuery={displaySearchQuery}
            placeholder="코스명 또는 지역명을 검색해 주세요"
            label="코스명 또는 지역명 검색"
            suggestions={recentSearchSuggestions}
            onRemoveSuggestion={handleRemoveRecentSearchSuggestion}
            pinnedSuggestion={{
              label: '전국 확인하기',
              onSelect: () => navigate('/yeogido-course/search'),
            }}
            onSearch={handleSearch}
          />
          <CourseFilterBar
            filterGroups={yeogidoCourseFilterGroups}
            selectedFilters={selectedFilters}
            openFilterKey={openFilterKey}
            filterContainerRef={filterContainerRef}
            isExtendedTransport={isExtendedTransportFilterLabel(
              selectedFilters.transport
            )}
            marginTop={FILTER_MARGIN_TOP}
            onToggle={handleFilterToggle}
            onSelect={(filterKey, option) => {
              handleFilterSelect(filterKey, option);
              if (filterKey === 'sort' && sortByLabel[option] === 'DISTANCE') {
                void requestCoordinates();
              }
            }}
          />
          <div
            className="grid grid-cols-2"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              columnGap: LIST_GAP * scale,
              rowGap: LIST_GAP * scale,
            }}
          >
            {isPending
              ? YEOGIDO_COURSE_SKELETON_ITEMS.map((item) => (
                  <ContentCardSkeleton
                    key={item}
                    className="w-full"
                    imageClassName="aspect-[163/115] h-auto"
                  />
                ))
              : yeogidoCourses.map(renderCourseCard)}

            {isFetchingNextPage
              ? YEOGIDO_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
                  <ContentCardSkeleton
                    key={`next-page-${item}`}
                    className="w-full"
                    imageClassName="aspect-[163/115] h-auto"
                  />
                ))
              : null}
          </div>

          {hasEmptyResult ? (
            <p
              className="text-gray-4 text-center font-medium"
              style={{
                marginTop: EMPTY_MARGIN_TOP * scale,
                fontSize: MESSAGE_TEXT_SIZE * scale,
              }}
            >
              검색 결과가 없습니다.
            </p>
          ) : null}

          {isError || isRegionError ? (
            <p
              className="text-main-5 text-center font-medium"
              style={{
                marginTop: ERROR_MARGIN_TOP * scale,
                fontSize: MESSAGE_TEXT_SIZE * scale,
              }}
            >
              코스 목록을 불러오지 못했어요.
            </p>
          ) : null}

          <div
            ref={loadMoreRef}
            style={{ height: LOAD_MORE_HEIGHT * scale }}
            aria-hidden="true"
          />

          {shouldShowSearchConditions ? (
            <div style={{ marginTop: SEARCH_CONDITIONS_MARGIN_TOP * scale }}>
              <SearchConditionChips
                conditions={conditionSearch.conditions}
                selectedCondition={conditionSearch.selectedCondition}
                onSelect={conditionSearch.selectCondition}
              />
            </div>
          ) : null}

          {shouldShowConditionCourses ? (
            <section
              className="grid grid-cols-2"
              aria-label={`${conditionSearch.selectedCondition} 조건으로 더 찾은 코스`}
              style={{
                marginTop: CONDITION_COURSES_MARGIN_TOP * scale,
                columnGap: LIST_GAP * scale,
                rowGap: LIST_GAP * scale,
              }}
            >
              {conditionSearch.isPending
                ? YEOGIDO_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
                    <ContentCardSkeleton
                      key={`condition-${item}`}
                      className="w-full"
                      imageClassName="aspect-[163/115] h-auto"
                    />
                  ))
                : conditionSearch.courses.map(renderCourseCard)}

              {isFetchingNextConditionPage
                ? YEOGIDO_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
                    <ContentCardSkeleton
                      key={`condition-next-page-${item}`}
                      className="w-full"
                      imageClassName="aspect-[163/115] h-auto"
                    />
                  ))
                : null}
            </section>
          ) : null}

          {hasEmptyConditionCourses ? (
            <p
              className="text-gray-4 text-center font-medium"
              style={{
                marginTop: EMPTY_MARGIN_TOP * scale,
                fontSize: MESSAGE_TEXT_SIZE * scale,
              }}
            >
              이 조건으로 더 찾은 코스가 없어요.
            </p>
          ) : null}

          {shouldShowConditionCourses && conditionSearch.isError ? (
            <p
              className="text-main-5 text-center font-medium"
              style={{
                marginTop: ERROR_MARGIN_TOP * scale,
                fontSize: MESSAGE_TEXT_SIZE * scale,
              }}
            >
              코스를 더 불러오지 못했어요.
            </p>
          ) : null}

          <div
            ref={loadMoreConditionRef}
            style={{ height: LOAD_MORE_HEIGHT * scale }}
            aria-hidden="true"
          />
        </div>
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default YeogidoCourseSearchPage;
