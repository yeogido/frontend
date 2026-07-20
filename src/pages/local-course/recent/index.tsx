import { useCallback } from 'react';

import { CourseCard, CourseCardSkeleton } from '../../../components/common';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

import { initialLocalCourseSelectedFilters } from '../constants/filters';
import { LOCAL_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useLocalRecentCourses from '../hooks/useLocalRecentCourses';

function LocalCourseRecentPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useLocalRecentCourses({ filters: initialLocalCourseSelectedFilters });

  const recentCourses = data?.pages.flatMap((page) => page.content) ?? [];

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
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-14 pb-10">
      <div>
        <h1 className="text-[18px] leading-none font-semibold text-black">
          최근 본 코스
        </h1>
        <p className="text-gray-5 mt-1.5 text-[14px] leading-none font-normal">
          최근 확인한 동네 코스를 다시 둘러보세요
        </p>
      </div>

      <div className="mt-[30px] flex flex-col gap-4">
        {isPending
          ? LOCAL_COURSE_SKELETON_ITEMS.map((item) => (
              <CourseCardSkeleton key={item} />
            ))
          : recentCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}

        {isFetchingNextPage
          ? LOCAL_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
              <CourseCardSkeleton key={`next-page-${item}`} />
            ))
          : null}
      </div>

      {isError ? (
        <p className="text-main-5 mt-6 text-center text-[13px] font-medium">
          최근 본 코스를 불러오지 못했어요.
        </p>
      ) : null}

      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
    </section>
  );
}

export default LocalCourseRecentPage;
