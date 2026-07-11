import { useCallback } from 'react';

import { ContentCard, ContentCardSkeleton } from '../../../components/common';

import courseMapImage from '../assets/courseimage.svg';
import { YeogidoCourseFilterChip } from '../components';
import { yeogidoCourseFilterGroups } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';
import useYeogidoCourses from '../hooks/useYeogidoCourses';

function YeogidoCoursePopularPage() {
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
  } = useYeogidoCourses();

  const popularCourses = data?.pages.flatMap((page) => page.content) ?? [];

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-4 pb-10">
      <div>
        <h1 className="text-[18px] leading-none font-semibold text-black">
          인기 추천 코스
        </h1>
        <p className="text-gray-4 mt-2 text-[12px] leading-none font-normal">
          여행자들이 가장 많이 찾는 추천 코스
        </p>
      </div>

      <div
        ref={filterContainerRef}
        className="mt-[18px] flex flex-wrap items-start gap-2"
      >
        {yeogidoCourseFilterGroups.map((filter) => (
          <div
            key={filter.key}
            className={filter.key === 'sort' ? 'ml-auto' : ''}
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

      <div className="mt-[27px] grid grid-cols-[repeat(auto-fill,minmax(163px,1fr))] gap-x-4 gap-y-[18px]">
        {isPending
          ? YEOGIDO_COURSE_SKELETON_ITEMS.map((item) => (
              <ContentCardSkeleton
                key={item}
                className="w-full"
                imageClassName="aspect-[174/115] h-auto"
              />
            ))
          : popularCourses.map((course) => (
              <ContentCard
                key={course.id}
                image={courseMapImage}
                title={course.title}
                firstInfo={course.duration}
                secondInfo={course.courseName}
                className="w-full"
                imageClassName="aspect-[174/115] h-auto"
              />
            ))}

        {isFetchingNextPage
          ? YEOGIDO_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
              <ContentCardSkeleton
                key={`next-page-${item}`}
                className="w-full"
                imageClassName="aspect-[174/115] h-auto"
              />
            ))
          : null}
      </div>

      {isError ? (
        <p className="text-main-5 mt-6 text-center text-[13px] font-medium">
          코스 목록을 불러오지 못했어요.
        </p>
      ) : null}

      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
    </section>
  );
}

export default YeogidoCoursePopularPage;
