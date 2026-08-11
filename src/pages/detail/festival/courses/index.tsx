import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseFilterBar,
} from '../../../../components/common';
import { isExtendedTransportFilterLabel } from '../../../../constants/courseFilterLayout';
import { useCourseLikeToggle } from '../../../../hooks/useCourseLikeToggle';
import {
  useCourses,
  useNavigateToCourseDetail,
} from '../../../../hooks/useCourses';
import { useCultureContentDetail } from '../../../../hooks/useCultureContentDetail';
import { useDistanceSortCoordinates } from '../../../../hooks/useDistanceSortCoordinates';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../../hooks/useInfiniteScroll';
import { toContentTagIds } from '../../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../../utils/courseEnumLabels';
import { festivalCoursesFilterGroups } from './constants/filters';
import useFestivalCoursesFilters from './hooks/useFestivalCoursesFilters';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../../types/course.type';

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
const EMPTY_MARGIN_TOP = 40;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const PAGE_SIZE = 20;

const SKELETON_ITEMS = [0, 1, 2, 3, 4, 5, 6, 7];

// 목록 필터 칩은 항상 원본 enum 값끼리 비교한다. 여기도 코스 검색
// 페이지들과 동일한 라벨↔enum 매핑 테이블(페이지마다 로컬로 둔다는
// 관례도 동일하게 따른다).
const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  대중교통: 'PUBLIC',
  자차: 'CAR',
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

// '전체'는 정렬 기준을 넘기지 않는다(서버 기본 정렬). '추천순'은 이
// 목록이 courseType을 지정하지 않아(OFFICIAL+LOCAL 혼합) 서버가 지원하지
// 않는다(COURSE4008)라 아예 뺐다.
const sortByLabel: Record<string, CourseSort | undefined> = {
  인기순: 'POPULAR',
  최신순: 'LATEST',
  저장순: 'SAVED',
  후기순: 'REVIEW',
  거리순: 'DISTANCE',
};

function FestivalRelatedCoursesPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();
  const contentId = Number(festivalId);
  const isValidContentId = Number.isInteger(contentId) && contentId > 0;
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { goToCourseDetail } = useNavigateToCourseDetail();

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useFestivalCoursesFilters();

  const isDistanceSort = selectedFilters.sort === '거리순';
  const distanceSortCoordinates = useDistanceSortCoordinates(isDistanceSort);

  const { data: content } = useCultureContentDetail(contentId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useCourses(
    {
      contentId,
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
    {
      enabled:
        isValidContentId &&
        (!isDistanceSort || distanceSortCoordinates !== null),
    }
  );

  const courses = data?.pages.flatMap((page) => page.items) ?? [];

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  const hasEmptyResult = !isPending && !isError && courses.length === 0;

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
          {content ? `'${content.title}'가 포함된 코스예요` : '포함된 코스'}
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          선택한 행사가 포함된 코스를 확인해 보세요
        </p>
      </div>

      <CourseFilterBar
        filterGroups={festivalCoursesFilterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        isExtendedTransport={isExtendedTransportFilterLabel(
          selectedFilters.transport
        )}
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
          ? SKELETON_ITEMS.map((item) => (
              <ContentCardSkeleton
                key={item}
                className="w-full"
                imageClassName="aspect-[163/115] h-auto"
              />
            ))
          : courses.map((course) => (
              <ContentCard
                key={course.courseId}
                image={course.thumbnailUrl}
                title={course.title}
                firstInfo={toDurationLabel(course.durationType)}
                secondInfo={toTransportLabel(course.transportType)}
                thirdInfo={toCompanionLabel(course.companionType)}
                tags={toContentTagIds(course.tags)}
                className="w-full"
                liked={getLiked(course.courseId, course.isLiked)}
                onClick={() => void goToCourseDetail(course.courseId)}
                onLikeClick={() =>
                  toggleLike(
                    course.courseId,
                    getLiked(course.courseId, course.isLiked)
                  )
                }
              />
            ))}

        {isFetchingNextPage
          ? SKELETON_ITEMS.slice(0, 4).map((item) => (
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
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          조건에 맞는 코스가 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
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
    </section>
  );
}

export default FestivalRelatedCoursesPage;
