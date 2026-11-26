import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseDeleteDialog,
  CourseFilterBar,
  EditableContentCard,
} from '../../../components/common';
import { isExtendedTransportFilterLabel } from '../../../constants/courseFilterLayout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCourseDelete, useCourses } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditCourse } from '../../../hooks/useEditCourse';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../types/course.type';
import { toContentTagIds } from '../../../utils/contentTags';
import {
  toCompanionLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import { yeogidoCourseFilterGroups } from '../constants/filters';
import { YEOGIDO_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';

const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 24;
const ERROR_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const PAGE_SIZE = 20;
const SKELETON_NEXT_PAGE_COUNT = 4;

const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  자동차: 'CAR',
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

interface YeogidoCourseListProps {
  /** 정렬 초기값. 비우면 공용 훅의 기본값(추천순)을 쓴다. */
  readonly initialSort?: string;
  /** 필터 줄 위 여백(디자인 px). 화면마다 위 요소가 달라 호출하는 쪽이 정한다. */
  readonly filterMarginTop: number;
}

/**
 * 모바일 여기도 추천 코스 목록 — 필터 줄, 2열 카드 그리드, 무한 스크롤.
 * 메인 화면과 인기 추천 코스 화면이 함께 쓴다.
 */
function YeogidoCourseList({
  initialSort,
  filterMarginTop,
}: YeogidoCourseListProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();
  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useYeogidoCourseFilters(initialSort ? { sort: initialSort } : undefined);

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
    isPending,
  } = useCourses(
    {
      courseType: 'OFFICIAL',
      transportType: transportTypeByLabel[selectedFilters.transport],
      durationType: durationTypeByLabel[selectedFilters.duration],
      companionType: companionTypeByLabel[selectedFilters.companion],
      sort: sortByLabel[selectedFilters.sort],
      latitude: isDistanceSort ? distanceSortCoordinates?.latitude : undefined,
      longitude: isDistanceSort
        ? distanceSortCoordinates?.longitude
        : undefined,
      size: PAGE_SIZE,
    },
    { enabled: !isDistanceSort || status === 'ready' || status === 'failed' }
  );

  const courses = data?.pages.flatMap((page) => page.items) ?? [];

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  const goToCourseDetail = (courseId: number | string) => {
    navigate(`/yeogido-course/detail/${courseId}`);
  };

  return (
    <>
      <CourseFilterBar
        filterGroups={yeogidoCourseFilterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        isExtendedTransport={isExtendedTransportFilterLabel(
          selectedFilters.transport
        )}
        marginTop={filterMarginTop}
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
          : courses.map((course) =>
              course.canManage ? (
                <EditableContentCard
                  key={course.courseId}
                  image={course.routeImageUrl?.trim() || course.thumbnailUrl}
                  title={course.title}
                  firstInfo={durationLabelByType[course.durationType]}
                  secondInfo={toTransportLabel(course.transportType)}
                  thirdInfo={toCompanionLabel(course.companionType)}
                  tags={toContentTagIds(course.tags)}
                  className="w-full"
                  onClick={() => goToCourseDetail(course.courseId)}
                  onEdit={() => void editCourse(course.courseId)}
                  onDelete={() => requestDelete(course.courseId)}
                />
              ) : (
                <ContentCard
                  key={course.courseId}
                  image={course.routeImageUrl?.trim() || course.thumbnailUrl}
                  title={course.title}
                  firstInfo={durationLabelByType[course.durationType]}
                  secondInfo={toTransportLabel(course.transportType)}
                  thirdInfo={toCompanionLabel(course.companionType)}
                  tags={toContentTagIds(course.tags)}
                  liked={getLiked(course.courseId, course.isLiked)}
                  className="w-full"
                  onClick={() => goToCourseDetail(course.courseId)}
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
          ? YEOGIDO_COURSE_SKELETON_ITEMS.slice(
              0,
              SKELETON_NEXT_PAGE_COUNT
            ).map((item) => (
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
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default YeogidoCourseList;
