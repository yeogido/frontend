import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseFilterBar,
  SearchBar,
} from '../../../components/common';
import {
  COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  courseRegionRecentSearchKeywords,
} from '../../../constants/recentSearches';
import { isExtendedTransportFilterLabel } from '../../../constants/courseFilterLayout';
import { yeogidoCourseSearchSuggestions } from '../../../constants/yeogidoCourseSearch';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { addStoredRecentSearch } from '../../../utils/recentSearches';

import courseMapImage from '../assets/courseimage.svg';
import { yeogidoCourseFilterGroups } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';
import useYeogidoCourses from '../hooks/useYeogidoCourses';

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

function YeogidoCourseSearchPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const handleCourseClick = (courseId: number | string) => {
    navigate(`/yeogido-course/detail/${courseId}`);
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
  } = useYeogidoCourseFilters();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useYeogidoCourses({
    filters: selectedFilters,
    keyword,
    region,
    subRegion,
  });

  const yeogidoCourses = data?.pages.flatMap((page) => page.content) ?? [];
  const hasEmptyResult =
    !isPending && !isError && yeogidoCourses.length === 0;

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
              suggestions={yeogidoCourseSearchSuggestions}
              onSearch={handleSearch}
            />
      <CourseFilterBar
        filterGroups={yeogidoCourseFilterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        isExtendedTransport={isExtendedTransportFilterLabel(selectedFilters.transport)}
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
          {isPending
            ? YEOGIDO_COURSE_SKELETON_ITEMS.map((item) => (
                <ContentCardSkeleton
                  key={item}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              ))
            : yeogidoCourses.map((course) => (
                <ContentCard
                  key={course.id}
                  image={courseMapImage}
                  title={course.title}
                  firstInfo={course.duration}
                  secondInfo={course.courseName}
                  tags={course.tags}
                  className="w-full"
                  onClick={() => handleCourseClick(course.id)}
                />
              ))}

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
            className="text-center font-medium text-gray-4"
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
  );
}

export default YeogidoCourseSearchPage;
