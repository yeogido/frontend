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
import { yeogidoCourseSearchSuggestions } from '../../../constants/yeogidoCourseSearch';
import { addStoredRecentSearch } from '../../../utils/recentSearches';

import courseMapImage from '../assets/courseimage.svg';
import { YeogidoCourseFilterChip } from '../components';
import { yeogidoCourseFilterGroups } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';
import useYeogidoCourses from '../hooks/useYeogidoCourses';

function YeogidoCourseSearchPage() {
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
          placeholder="코스명 또는 지역명을 검색해 주세요"
          label="코스명 또는 지역명 검색"
          suggestions={yeogidoCourseSearchSuggestions}
          onSearch={handleSearch}
        />

        <div
          ref={filterContainerRef}
          className={`mt-3 ${COURSE_FILTER_CONTAINER_CLASS_NAME}`}
        >
          <div className={filterGridClassName}>
            {yeogidoCourseFilterGroups.map((filter) => (
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
                  imageClassName="aspect-[163/115] h-auto"
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

export default YeogidoCourseSearchPage;
