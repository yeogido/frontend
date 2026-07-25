import { useCallback } from 'react';

import { CourseCard, CourseCardSkeleton } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import { initialYeogidoCourseSelectedFilters } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useYeogidoCourses from '../hooks/useYeogidoCourses';
import { toRecentCourseCardProps } from './constants/recentCourses';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 56;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const LIST_MARGIN_TOP = 30;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 24;
const ERROR_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;

function YeogidoCourseRecentPage() {
  const scale = useGlobalScale();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useYeogidoCourses({ filters: initialYeogidoCourseSelectedFilters });

  const recentCourses =
    data?.pages.flatMap((page) => page.content).map(toRecentCourseCardProps) ??
    [];

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
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold leading-none text-black"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          최근 본 코스
        </h1>
        <p
          className="text-gray-5 font-normal leading-none"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
          }}
        >
          최근 확인한 코스를 다시 둘러보세요
        </p>
      </div>

      <div
        className="flex flex-col"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          gap: LIST_GAP * scale,
        }}
      >
        {isPending
          ? YEOGIDO_COURSE_SKELETON_ITEMS.map((item) => (
              <CourseCardSkeleton key={item} />
            ))
          : recentCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}

        {isFetchingNextPage
          ? YEOGIDO_COURSE_SKELETON_ITEMS.slice(0, 4).map((item) => (
              <CourseCardSkeleton key={`next-page-${item}`} />
            ))
          : null}
      </div>

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: ERROR_TEXT_SIZE * scale,
          }}
        >
          최근 본 코스를 불러오지 못했어요.
        </p>
      ) : null}

      <div
        ref={loadMoreRef}
        style={{ height: LOAD_MORE_HEIGHT * scale }}
        aria-hidden="true"
      />
    </section>
  );
}

export default YeogidoCourseRecentPage;
