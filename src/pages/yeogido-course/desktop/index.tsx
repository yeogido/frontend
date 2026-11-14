import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import heartIcon from '../../../assets/icons/heart.svg';
import likedIcon from '../../../assets/icons/oheart.svg';
import calendarIcon from '../../../assets/icons/calendar.svg';
import locationIcon from '../../../assets/icons/location.svg';
import peopleIcon from '../../../assets/icons/people.svg';
import { CourseDeleteDialog } from '../../../components/common';
import CardActionMenu from '../../../components/common/CardActionMenu';
import TagChip from '../../../components/common/TagChip';
import { DesktopPageShell } from '../../../components/layout/desktop';
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
  toDurationLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import { buildCourseDetailPath } from '../../../utils/routes';
import { yeogidoCourseFilterGroups } from '../constants/filters';
import useYeogidoCourseFilters from '../hooks/useYeogidoCourseFilters';

// Figma 1440 데스크톱 시안(6291:41574) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
// DesktopPageShell 기본 위 여백(60)에 더해 시안의 제목 위치(209)를 맞춘다.
const EXTRA_TOP_SPACE = 1;
const PAGE_SIZE = 20;

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
const sortByLabel: Record<string, CourseSort> = {
  추천순: 'RECOMMEND',
  인기순: 'POPULAR',
  최신순: 'LATEST',
  저장순: 'SAVED',
  후기순: 'REVIEW',
  거리순: 'DISTANCE',
};
const filterLabels = {
  transport: '이동 수단',
  duration: '여행 기간',
  companion: '동행',
  sort: '정렬',
};

interface YeogidoCourseDesktopPageProps {
  /** 인기 추천 코스 경로처럼 정렬 기본값이 추천순이 아닌 화면에서 쓴다. */
  readonly defaultSort?: string;
}

/** 데스크톱 여기도 추천 코스 목록 — 필터 3개와 정렬, 3열 카드. */
function YeogidoCourseDesktopPage({
  defaultSort,
}: YeogidoCourseDesktopPageProps) {
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();
  const { selectedFilters, handleFilterSelect } = useYeogidoCourseFilters(
    defaultSort ? { sort: defaultSort } : undefined
  );
  const { coordinates, status, requestCoordinates } =
    useDistanceSortCoordinates();
  const isDistanceSort = selectedFilters.sort === '거리순';

  // 거리순을 고르면 위치를 한 번 요청한다. 실패 후 다시 고르면 재요청한다.
  const locationRequested = useRef(false);
  useEffect(() => {
    if (isDistanceSort && status === 'idle' && !locationRequested.current) {
      locationRequested.current = true;
      void requestCoordinates();
    }
  }, [isDistanceSort, status, requestCoordinates]);

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourses(
    {
      courseType: 'OFFICIAL',
      transportType: transportTypeByLabel[selectedFilters.transport],
      durationType: durationTypeByLabel[selectedFilters.duration],
      companionType: companionTypeByLabel[selectedFilters.companion],
      sort: sortByLabel[selectedFilters.sort],
      latitude: isDistanceSort ? coordinates?.latitude : undefined,
      longitude: isDistanceSort ? coordinates?.longitude : undefined,
      size: PAGE_SIZE,
    },
    { enabled: !isDistanceSort || status === 'ready' || status === 'failed' }
  );
  const courses = data?.pages.flatMap((page) => page.items) ?? [];

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending && !isError,
    onIntersect: handleIntersect,
  });

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div
        style={{ marginTop: EXTRA_TOP_SPACE }}
        className="flex flex-col gap-[32px]"
      >
        <div className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] font-semibold text-black">
            여기도 가볼까?
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            새로운 여행지를 발견해 보세요
          </p>
        </div>

        <div className="flex items-start gap-[16px]">
          {yeogidoCourseFilterGroups.map((group) => (
            <label
              key={group.key}
              className={group.key === 'sort' ? 'ml-auto' : ''}
            >
              <span className="sr-only">{filterLabels[group.key]}</span>
              <select
                value={selectedFilters[group.key]}
                onChange={(event) => {
                  const value = event.target.value;
                  handleFilterSelect(group.key, value);
                  if (
                    group.key === 'sort' &&
                    value === '거리순' &&
                    status === 'failed'
                  ) {
                    void requestCoordinates();
                  }
                }}
                className="border-gray-2 text-gray-4 h-[37px] cursor-pointer rounded-full border bg-white px-[10px] text-[18px]"
              >
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {isPending ? (
          <p className="text-gray-4 py-[48px] text-center">
            코스를 불러오는 중이에요.
          </p>
        ) : null}
        {isError ? (
          <div className="py-[48px] text-center">
            <p className="text-main-5">코스 목록을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="border-gray-2 mt-[16px] rounded-full border px-[16px] py-[8px]"
            >
              다시 시도
            </button>
          </div>
        ) : null}
        {!isPending && !isError && courses.length === 0 ? (
          <p className="text-gray-4 py-[48px] text-center">
            조건에 맞는 코스가 없어요.
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-x-[24px] gap-y-[32px]">
          {courses.map((course) => {
            const liked = getLiked(course.courseId, course.isLiked);
            const image = course.routeImageUrl?.trim() || course.thumbnailUrl;
            const openDetail = () =>
              navigate(buildCourseDetailPath('OFFICIAL', course.courseId));

            return (
              <article
                key={course.courseId}
                className="flex min-w-0 flex-col gap-[16px]"
              >
                <div className="bg-background relative aspect-[333/236] overflow-hidden rounded-[12px]">
                  <button
                    type="button"
                    onClick={openDetail}
                    aria-label={`${course.title} 상세 보기`}
                    className="block h-full w-full"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </button>
                  {course.canManage ? (
                    <CardActionMenu
                      onEdit={() => void editCourse(course.courseId)}
                      onDelete={() => requestDelete(course.courseId)}
                      triggerSize={24}
                      triggerClassName="absolute top-[16px] right-[16px]"
                      ariaLabel={`${course.title} 메뉴`}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleLike(course.courseId, liked)}
                      aria-label={liked ? '좋아요 취소' : '좋아요'}
                      aria-pressed={liked}
                      className="absolute top-[16px] right-[16px] flex size-[24px] items-center justify-center"
                    >
                      <img
                        src={liked ? likedIcon : heartIcon}
                        alt=""
                        className="size-[24px]"
                      />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-[8px]">
                  <button
                    type="button"
                    onClick={openDetail}
                    className="block w-full truncate text-left text-[20px] leading-[1.5] font-medium text-black"
                  >
                    {course.title}
                  </button>
                  <div className="text-gray-4 flex flex-wrap items-center gap-[8px] text-[16px] font-medium">
                    <span className="flex items-center gap-[2px]">
                      <img src={calendarIcon} alt="" className="size-[18px]" />
                      {toDurationLabel(course.durationType)}
                    </span>
                    <span className="flex items-center gap-[2px]">
                      <img src={locationIcon} alt="" className="size-[18px]" />
                      {toTransportLabel(course.transportType)}
                    </span>
                    <span className="flex items-center gap-[2px]">
                      <img src={peopleIcon} alt="" className="size-[18px]" />
                      {toCompanionLabel(course.companionType)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-[8px]">
                  {toContentTagIds(course.tags).map((tag, index) => (
                    <TagChip
                      key={`${tag}-${index}`}
                      type={tag}
                      style={{ height: 25 }}
                    />
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {isFetchingNextPage ? (
          <p className="text-gray-4 text-center">
            코스를 더 불러오는 중이에요.
          </p>
        ) : null}
        <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
      </div>
      <CourseDeleteDialog {...dialogProps} />
    </DesktopPageShell>
  );
}

export default YeogidoCourseDesktopPage;
