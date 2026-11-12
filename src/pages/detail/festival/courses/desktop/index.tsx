import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import DesktopFilterDropdown from '../../../../../components/layout/desktop/DesktopFilterDropdown';
import DesktopPageShell from '../../../../../components/layout/desktop/DesktopPageShell';
import { useCourseLikeToggle } from '../../../../../hooks/useCourseLikeToggle';
import {
  useCourses,
  useNavigateToCourseDetail,
} from '../../../../../hooks/useCourses';
import { useCultureContentDetail } from '../../../../../hooks/useCultureContentDetail';
import { useDistanceSortCoordinates } from '../../../../../hooks/useDistanceSortCoordinates';
import useInfiniteScroll from '../../../../../hooks/useInfiniteScroll';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../../../types/course.type';
import { toContentTagIds } from '../../../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../../../utils/courseEnumLabels';
import CourseDesktopCard from '../../../desktop/CourseDesktopCard';
import {
  festivalCoursesFilterGroups,
  initialFestivalCoursesSelectedFilters,
  type FestivalCoursesFilterKey,
  type FestivalCoursesSelectedFilters,
} from '../constants/filters';

// Figma 1440 데스크톱 시안(6297:46211) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const TITLE_OFFSET_TOP = 60;
const CARD_IMAGE_HEIGHT = 236;
const PAGE_SIZE = 20;
const SKELETON_COUNT = 6;
const SKELETON_HEIGHT = 350;

// 모바일 행사 포함 코스 화면과 같은 라벨↔enum 매핑. 페이지마다 로컬로 둔다.
const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
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

const sortByLabel: Record<string, CourseSort | undefined> = {
  인기순: 'POPULAR',
  최신순: 'LATEST',
  저장순: 'SAVED',
  후기순: 'REVIEW',
  거리순: 'DISTANCE',
};

const FILTER_LABELS: Record<FestivalCoursesFilterKey, string> = {
  transport: '이동수단',
  duration: '기간',
  companion: '동행',
  sort: '정렬',
};

function getGroup(key: FestivalCoursesFilterKey) {
  return festivalCoursesFilterGroups.find((group) => group.key === key)!;
}

function FestivalCoursesDesktopPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();
  const contentId = Number(festivalId);
  const isValidContentId = Number.isInteger(contentId) && contentId > 0;
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { goToCourseDetail } = useNavigateToCourseDetail();
  const [selectedFilters, setSelectedFilters] =
    useState<FestivalCoursesSelectedFilters>(
      initialFestivalCoursesSelectedFilters
    );
  const {
    coordinates: distanceSortCoordinates,
    status,
    requestCoordinates,
  } = useDistanceSortCoordinates();
  const { data: content } = useCultureContentDetail(contentId);

  const isDistanceSort = selectedFilters.sort === '거리순';

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
        (!isDistanceSort || status === 'ready' || status === 'failed'),
    }
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

  const handleFilterChange = (
    key: FestivalCoursesFilterKey,
    option: string
  ) => {
    setSelectedFilters((filters) => ({ ...filters, [key]: option }));
    if (key === 'sort' && sortByLabel[option] === 'DISTANCE') {
      void requestCoordinates();
    }
  };

  const renderDropdown = (
    key: FestivalCoursesFilterKey,
    align: 'left' | 'right' = 'left'
  ) => (
    <DesktopFilterDropdown
      label={FILTER_LABELS[key]}
      options={getGroup(key).options}
      value={selectedFilters[key]}
      onChange={(option) => handleFilterChange(key, option)}
      align={align}
    />
  );

  const hasEmptyResult = !isPending && !isError && courses.length === 0;

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div
        style={{ paddingTop: TITLE_OFFSET_TOP }}
        className="flex flex-col gap-[32px]"
      >
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] font-semibold text-black">
            {content ? `“${content.title}”가 포함된 코스예요` : '포함된 코스'}
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            선택한 행사가 포함된 코스를 확인해 보세요
          </p>
        </header>

        <section className="flex flex-col gap-[32px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              {renderDropdown('transport')}
              {renderDropdown('duration')}
              {renderDropdown('companion')}
            </div>
            {renderDropdown('sort', 'right')}
          </div>

          <div className="grid grid-cols-3 gap-x-[24px] gap-y-[48px]">
            {isPending
              ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    style={{ height: SKELETON_HEIGHT }}
                    className="bg-gray-2 animate-pulse rounded-[12px]"
                  />
                ))
              : courses.map((course) => (
                  <CourseDesktopCard
                    key={course.courseId}
                    image={course.routeImageUrl?.trim() || course.thumbnailUrl}
                    title={course.title}
                    duration={toDurationLabel(course.durationType)}
                    courseType={toTransportLabel(course.transportType)}
                    companion={toCompanionLabel(course.companionType)}
                    tags={toContentTagIds(course.tags)}
                    liked={getLiked(course.courseId, course.isLiked)}
                    imageHeight={CARD_IMAGE_HEIGHT}
                    onClick={() => void goToCourseDetail(course.courseId)}
                    onLikeClick={() =>
                      toggleLike(
                        course.courseId,
                        getLiked(course.courseId, course.isLiked)
                      )
                    }
                  />
                ))}
          </div>

          {isFetchingNextPage ? (
            <p className="text-gray-4 text-center text-[16px]">
              불러오는 중이에요.
            </p>
          ) : null}

          {hasEmptyResult ? (
            <p className="text-gray-4 text-center text-[16px] font-medium">
              조건에 맞는 코스가 없습니다.
            </p>
          ) : null}

          {isError ? (
            <p
              role="alert"
              className="text-main-5 text-center text-[16px] font-medium"
            >
              코스 목록을 불러오지 못했어요.
            </p>
          ) : null}

          <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
        </section>
      </div>
    </DesktopPageShell>
  );
}

export default FestivalCoursesDesktopPage;
