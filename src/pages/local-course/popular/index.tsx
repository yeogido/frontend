import { useCallback } from 'react';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseFilterBar,
} from '../../../components/common';
import { isExtendedTransportFilterLabel } from '../../../constants/courseFilterLayout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

import { localCourseFilterGroups } from '../constants/filters';
import { LOCAL_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useLocalCourseFilters from '../hooks/useLocalCourseFilters';
import useLocalCourses from '../hooks/useLocalCourses';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const FILTER_MARGIN_TOP = 15;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 24;
const ERROR_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;

function LocalCoursePopularPage() {
  const scale = useGlobalScale();
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
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          인기 추천 코스
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          여행자들이 가장 많이 찾는 추천 코스
        </p>
      </div>
      <CourseFilterBar
        filterGroups={localCourseFilterGroups}
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
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: ERROR_TEXT_SIZE * scale,
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
    </section>
  );
}

export default LocalCoursePopularPage;
