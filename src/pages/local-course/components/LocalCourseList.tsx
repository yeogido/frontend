import { useCallback, type ReactNode } from 'react';
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
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useIsAdmin } from '../../../hooks/useMyProfile';
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
import { localCourseFilterGroups } from '../constants/filters';
import { LOCAL_COURSE_SKELETON_ITEMS } from '../constants/ui';
import useLocalCourseFilters from '../hooks/useLocalCourseFilters';

const LIST_MARGIN_TOP = 24;
const FEATURED_MARGIN_TOP = 24;
// 큰 카드 아래 그리드까지의 간격 (Figma 모바일 시안: 카드 끝 → 그리드 32)
const LIST_MARGIN_TOP_AFTER_FEATURED = 32;
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

interface LocalCourseListProps {
  /** 필터 줄 위 여백(디자인 px). 화면마다 위 요소가 달라 호출하는 쪽이 정한다. */
  readonly filterMarginTop: number;
  /** 필터 줄과 그리드 사이에 놓는 큰 카드. 있으면 그리드와의 간격이 달라진다. */
  readonly featured?: ReactNode;
}

/**
 * 모바일 우리동네 코스 목록 — 필터 줄, 2열 카드 그리드, 무한 스크롤.
 * 메인 화면과 인기 추천 코스 화면이 함께 쓴다.
 */
function LocalCourseList({ filterMarginTop, featured }: LocalCourseListProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { requestDelete, dialogProps } = useCourseDelete();
  const { editLocalCourse } = useEditLocalCourse();
  const isAdmin = useIsAdmin();
  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useLocalCourseFilters();

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
      courseType: 'LOCAL',
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
    navigate(`/local-course/detail/${courseId}`);
  };

  return (
    <>
      <CourseFilterBar
        filterGroups={localCourseFilterGroups}
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

      {featured ? (
        <div style={{ marginTop: FEATURED_MARGIN_TOP * scale }}>{featured}</div>
      ) : null}

      <div
        className="grid grid-cols-2"
        style={{
          marginTop:
            (featured ? LIST_MARGIN_TOP_AFTER_FEATURED : LIST_MARGIN_TOP) *
            scale,
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
                  onEdit={
                    isAdmin
                      ? undefined
                      : () => void editLocalCourse(course.courseId)
                  }
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
          ? LOCAL_COURSE_SKELETON_ITEMS.slice(0, SKELETON_NEXT_PAGE_COUNT).map(
              (item) => (
                <ContentCardSkeleton
                  key={`next-page-${item}`}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              )
            )
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

export default LocalCourseList;
