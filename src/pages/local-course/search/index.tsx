import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SearchBar,
} from '../../../components/common';
import {
  COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  courseRegionRecentSearchKeywords,
} from '../../../constants/recentSearches';
import {
  COURSE_FILTER_CONTAINER_CLASS_NAME,
  getCourseFilterColumnClassName,
  getCourseFilterGridClassName,
  isExtendedTransportFilterLabel,
} from '../../../constants/courseFilterLayout';
import { localCourseSearchSuggestions } from '../../../constants/localCourseSearch';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { addStoredRecentSearch } from '../../../utils/recentSearches';
import { YeogidoCourseFilterChip } from '../../yeogido-course/components';

import { localCourseFilterGroups } from '../constants/filters';
import { LOCAL_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useLocalCourseFilters from '../hooks/useLocalCourseFilters';
import useLocalCourses from '../hooks/useLocalCourses';

function LocalCourseSearchPage() {
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useLocalCourses({
    filters: selectedFilters,
    keyword,
    region,
    subRegion,
  });

  const courses = data?.pages.flatMap((page) => page.content) ?? [];
  const hasEmptyResult = !isPending && !isError && courses.length === 0;
  const filterGridClassName =
    getCourseFilterGridClassName(
      isExtendedTransportFilterLabel(selectedFilters.transport)
    );

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
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-3 pb-10">
      <div className="w-full">
        <SearchBar
          initialQuery={displaySearchQuery}
          placeholder="지역명 또는 도시명을 검색해 주세요"
          label="지역명 또는 도시명 검색"
          suggestions={localCourseSearchSuggestions}
          onSearch={handleSearch}
        />

        <div
          ref={filterContainerRef}
          className={`mt-3 ${COURSE_FILTER_CONTAINER_CLASS_NAME}`}
        >
          <div className={filterGridClassName}>
            {localCourseFilterGroups.map((filter) => (
              <div
                key={filter.key}
                className={getCourseFilterColumnClassName(filter.key)}
              >
                <YeogidoCourseFilterChip
                  label={selectedFilters[filter.key]}
                  options={[...filter.options]}
                  isOpen={openFilterKey === filter.key}
                  onToggle={() => handleFilterToggle(filter.key)}
                  onSelect={(option) => handleFilterSelect(filter.key, option)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
          {isPending
            ? LOCAL_COURSE_SKELETON_ITEMS.map((item) => (
                <ContentCardSkeleton
                  key={item}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              ))
            : courses.map((course) => (
                <ContentCard
                  key={course.id}
                  image={course.image}
                  title={course.title}
                  firstInfo={course.duration}
                  secondInfo={course.courseType}
                  liked={course.liked}
                  tags={course.tags}
                  className="w-full"
                />
              ))}

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
          <p className="mt-10 text-center text-[13px] font-medium text-gray-4">
            검색 결과가 없습니다.
          </p>
        ) : null}

        {isError ? (
          <p className="text-main-5 mt-6 text-center text-[13px] font-medium">
            코스 목록을 불러오지 못했어요.
          </p>
        ) : null}

        <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
      </div>
    </section>
  );
}

export default LocalCourseSearchPage;
