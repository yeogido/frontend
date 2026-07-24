import { useCallback } from 'react';

import {
  ContentCard,
  ContentCardSkeleton,
} from '../../../components/common';
import {
  COURSE_FILTER_CONTAINER_CLASS_NAME,
  getCourseFilterColumnClassName,
  getCourseFilterGridClassName,
  isExtendedTransportFilterLabel,
} from '../../../constants/courseFilterLayout';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { YeogidoCourseFilterChip } from '../../yeogido-course/components';

import { localCourseFilterGroups } from '../constants/filters';
import { LOCAL_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useLocalCourseFilters from '../hooks/useLocalCourseFilters';
import useLocalCourses from '../hooks/useLocalCourses';

function LocalCoursePopularPage() {
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
  } = useLocalCourses({ filters: selectedFilters });

  const courses = data?.pages.flatMap((page) => page.content) ?? [];
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
    enabled: hasNextPage && !isPending,
    onIntersect: handleIntersect,
  });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-3 pb-10">
      <div>
        <h1 className="text-[18px] leading-[22px] font-semibold text-black">
          인기 추천 코스
        </h1>
        <p className="text-gray-4 mt-[5px] text-[12px] leading-[17px] font-normal">
          여행자들이 가장 많이 찾는 추천 코스
        </p>
      </div>

      <div
        ref={filterContainerRef}
        className={`mt-[15px] ${COURSE_FILTER_CONTAINER_CLASS_NAME}`}
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

      {isError ? (
        <p className="text-main-5 mt-6 text-center text-[13px] font-medium">
          코스 목록을 불러오지 못했어요.
        </p>
      ) : null}

      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
    </section>
  );
}

export default LocalCoursePopularPage;
