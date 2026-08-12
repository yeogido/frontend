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

import { yeogidoCourseFilterGroups } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../types/course.type';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const FILTER_MARGIN_TOP = 12;
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
  대중교통: 'PUBLIC',
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

function YeogidoCourseSearchPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

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
  const hasEmptyResult =
    !isRegionPending &&
    !isPending &&
    !isError &&
    !isRegionError &&
    yeogidoCourses.length === 0;

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    const nextSearchParams = new URLSearchParams(searchParams);

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
              : yeogidoCourses.map((course) =>
                  course.canManage ? (
                    <EditableContentCard
                      key={course.courseId}
                      image={
                        course.routeImageUrl?.trim() || course.thumbnailUrl
                      }
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
                      image={
                        course.routeImageUrl?.trim() || course.thumbnailUrl
                      }
                      title={course.title}
                      firstInfo={durationLabelByType[course.durationType]}
                      secondInfo={toTransportLabel(course.transportType)}
                      thirdInfo={toCompanionLabel(course.companionType)}
                      tags={toContentTagIds(course.tags)}
                      liked={getLiked(course.courseId, course.isLiked)}
                      className="w-full"
                      onClick={() => handleCourseClick(course.courseId)}
                      onLikeClick={() =>
                        toggleLike(
                          course.courseId,
                          getLiked(course.courseId, course.isLiked)
                        )
                      }
                    />
                  )
                )}

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
        </div>
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default YeogidoCourseSearchPage;
