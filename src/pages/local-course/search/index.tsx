import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseDeleteDialog,
  CourseFilterBar,
  EditableContentCard,
  SearchBar,
} from '../../../components/common';
import {
  COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  courseRegionRecentSearchKeywords,
} from '../../../constants/recentSearches';
import { isExtendedTransportFilterLabel } from '../../../constants/courseFilterLayout';
import { localCourseSearchSuggestions } from '../../../constants/localCourseSearch';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  useCourseDelete,
  useCourses,
  useMyCourseIds,
} from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import { addStoredRecentSearch } from '../../../utils/recentSearches';
import { toContentTagIds } from '../../../utils/contentTags';

import { localCourseFilterGroups } from '../constants/filters';
import { LOCAL_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useLocalCourseFilters from '../hooks/useLocalCourseFilters';
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

// LOCAL 코스 목록은 RECOMMEND 정렬을 지원하지 않아(COURSE4008),
// 우리동네 코스에는 '추천순' 옵션 자체가 없다.
const sortByLabel: Record<string, CourseSort> = {
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

function LocalCourseSearchPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { courseIds: myCourseIds, isPending: isMyCourseIdsPending } =
    useMyCourseIds();
  const isAdmin = useIsAdmin();
  const { editLocalCourse } = useEditLocalCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const handleCourseClick = (courseId: number | string) => {
    navigate(`/local-course/detail/${courseId}`);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const region = searchParams.get('region') ?? '';
  const subRegion = searchParams.get('subRegion') ?? '';
  const regionSearchQuery =
    region && subRegion ? `${region} ${subRegion}` : subRegion || region;
  const displaySearchQuery = keyword || regionSearchQuery;

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useLocalCourseFilters();

  const isDistanceSort = selectedFilters.sort === '거리순';
  const distanceSortCoordinates = useDistanceSortCoordinates(isDistanceSort);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useCourses(
    {
      courseType: 'LOCAL',
      keyword: displaySearchQuery.trim() || undefined,
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
    { enabled: !isDistanceSort || distanceSortCoordinates !== null }
  );

  const courses = data?.pages.flatMap((page) => page.items) ?? [];
  const hasEmptyResult = !isPending && !isError && courses.length === 0;

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
      addStoredRecentSearch(trimmedQuery, {
        storageKey: COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
        fallbackSearches: courseRegionRecentSearchKeywords,
      });
    } else {
      nextSearchParams.delete('keyword');
      nextSearchParams.delete('region');
      nextSearchParams.delete('subRegion');
    }

    setSearchParams(nextSearchParams);
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
            placeholder="지역명 또는 도시명을 검색해 주세요"
            label="지역명 또는 도시명 검색"
            suggestions={localCourseSearchSuggestions}
            pinnedSuggestion={{
              label: '전국 확인하기',
              onSelect: () => navigate('/local-course/search'),
            }}
            onSearch={handleSearch}
          />
          <CourseFilterBar
            filterGroups={localCourseFilterGroups}
            selectedFilters={selectedFilters}
            openFilterKey={openFilterKey}
            filterContainerRef={filterContainerRef}
            isExtendedTransport={isExtendedTransportFilterLabel(
              selectedFilters.transport
            )}
            marginTop={FILTER_MARGIN_TOP}
            onToggle={handleFilterToggle}
            onSelect={handleFilterSelect}
          />
          <div
            className="grid grid-cols-2"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              columnGap: LIST_GAP * scale,
              rowGap: LIST_GAP * scale,
            }}
          >
            {isPending || isMyCourseIdsPending
              ? LOCAL_COURSE_SKELETON_ITEMS.map((item) => (
                  <ContentCardSkeleton
                    key={item}
                    className="w-full"
                    imageClassName="aspect-[163/115] h-auto"
                  />
                ))
              : courses.map((course) =>
                  isAdmin || myCourseIds.has(course.courseId) ? (
                    <EditableContentCard
                      key={course.courseId}
                      image={course.thumbnailUrl}
                      title={course.title}
                      firstInfo={durationLabelByType[course.durationType]}
                      secondInfo={course.region}
                      tags={toContentTagIds(course.tags)}
                      className="w-full"
                      onClick={() => handleCourseClick(course.courseId)}
                      onEdit={() => void editLocalCourse(course.courseId)}
                      onDelete={() => requestDelete(course.courseId)}
                    />
                  ) : (
                    <ContentCard
                      key={course.courseId}
                      image={course.thumbnailUrl}
                      title={course.title}
                      firstInfo={durationLabelByType[course.durationType]}
                      secondInfo={course.region}
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
              ? LOCAL_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
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

          {isError ? (
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

export default LocalCourseSearchPage;
