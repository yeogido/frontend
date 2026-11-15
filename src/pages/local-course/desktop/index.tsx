import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import heroImage from '../../../assets/images/hero-neighborhood-desktop.png';
import calendarIcon from '../../../assets/icons/calendar.svg';
import locationIcon from '../../../assets/icons/location.svg';
import peopleIcon from '../../../assets/icons/people.svg';
import heartIcon from '../../../assets/icons/heart.svg';
import likedIcon from '../../../assets/icons/oheart.svg';
import { CourseDeleteDialog } from '../../../components/common';
import CardActionMenu from '../../../components/common/CardActionMenu';
import TagChip from '../../../components/common/TagChip';
import {
  DesktopFooter,
  DesktopHeader,
} from '../../../components/layout/desktop';
import { useCourseDelete, useCourses } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useMyProfile } from '../../../hooks/useMyProfile';
import { useAuthStore } from '../../../store/auth.store';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../types/course.type';
import { toContentTagIds } from '../../../utils/contentTags';
import { isAdminRole } from '../../../utils/role';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import { localCourseFilterGroups } from '../constants/filters';
import useLocalCourseFilters from '../hooks/useLocalCourseFilters';

const transport: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  자차: 'CAR',
};
const duration: Record<string, CourseDurationType | undefined> = {
  당일치기: 'DAY_TRIP',
  '1박 2일': 'ONE_NIGHT',
  '2박 3일': 'TWO_NIGHT',
  '3박 이상': 'THREE_PLUS',
};
const companion: Record<string, CourseCompanionType | undefined> = {
  혼자: 'SOLO',
  친구와: 'FRIEND',
  연인과: 'COUPLE',
  가족과: 'FAMILY',
  반려동물과: 'PET',
};
const sort: Record<string, CourseSort> = {
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

/** Figma 6336:78472 — 데스크톱 우리동네 코스 목록. */
function LocalCourseDesktopPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const { selectedFilters, handleFilterSelect } = useLocalCourseFilters();
  const { coordinates, status, requestCoordinates } =
    useDistanceSortCoordinates();
  const isDistanceSort = selectedFilters.sort === '거리순';
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { requestDelete, dialogProps } = useCourseDelete();
  const { editLocalCourse } = useEditLocalCourse();
  const { data: profile, isError: isProfileError } = useMyProfile();
  const canShowManagement =
    isAuthenticated && !!profile?.role && !isProfileError;
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
      courseType: 'LOCAL',
      transportType: transport[selectedFilters.transport],
      durationType: duration[selectedFilters.duration],
      companionType: companion[selectedFilters.companion],
      sort: sort[selectedFilters.sort],
      latitude: isDistanceSort ? coordinates?.latitude : undefined,
      longitude: isDistanceSort ? coordinates?.longitude : undefined,
      size: 20,
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

  const createCourse = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    useLocalRecommendationStore.getState().resetDraft();
    navigate('/local-recommendation');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <DesktopHeader />
      <main className="flex-1">
        <section
          className="bg-gray-5 relative flex h-[320px] items-center overflow-hidden"
          aria-label="우리동네 추천 코스"
        >
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative mx-auto w-full max-w-[1040px] px-[16px] text-white">
            <p className="mb-[12px] text-[18px] font-medium">
              우리 동네 추천 코스
            </p>
            <h1 className="text-[32px] leading-[1.25] font-semibold">
              내가 아는 숨은 명소를
              <br />
              다른 여행자에게 소개해보세요!
            </h1>
            <button
              type="button"
              onClick={createCourse}
              className="bg-main-5 mt-[24px] rounded-full px-[20px] py-[12px] text-[18px] font-semibold text-white"
            >
              ＋ 코스 만들기
            </button>
          </div>
        </section>

        <section
          aria-label="우리동네 추천 코스 목록"
          className="mx-auto min-h-[800px] w-full max-w-[1040px] px-[16px] pt-[60px] pb-[120px]"
        >
          <div className="mb-[24px] flex flex-wrap items-center gap-[12px]">
            {localCourseFilterGroups.map((group) => (
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
                    )
                      void requestCoordinates();
                  }}
                  className="border-gray-2 text-gray-4 rounded-full border bg-white px-[12px] py-[8px] text-[16px]"
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
              return (
                <article key={course.courseId} className="min-w-0">
                  <div className="bg-background relative aspect-[333/236] overflow-hidden rounded-[12px]">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/local-course/detail/${course.courseId}`)
                      }
                      className="block h-full w-full"
                      aria-label={`${course.title} 상세 보기`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </button>
                    {course.canManage && canShowManagement ? (
                      <CardActionMenu
                        onEdit={
                          isAdminRole(profile?.role)
                            ? undefined
                            : () => void editLocalCourse(course.courseId)
                        }
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
                        className="absolute top-[16px] right-[16px] flex size-[36px] items-center justify-center"
                      >
                        <img
                          src={liked ? likedIcon : heartIcon}
                          alt=""
                          className="size-[24px]"
                        />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/local-course/detail/${course.courseId}`)
                    }
                    className="mt-[16px] block w-full truncate text-left text-[20px] font-semibold text-black"
                  >
                    {course.title}
                  </button>
                  <div className="text-gray-4 mt-[12px] flex flex-wrap items-center gap-[8px] text-[14px]">
                    <span className="flex items-center gap-[4px]">
                      <img src={calendarIcon} alt="" className="size-[16px]" />
                      {toDurationLabel(course.durationType)}
                    </span>
                    <span className="flex items-center gap-[4px]">
                      <img src={locationIcon} alt="" className="size-[16px]" />
                      {toTransportLabel(course.transportType)}
                    </span>
                    <span className="flex items-center gap-[4px]">
                      <img src={peopleIcon} alt="" className="size-[16px]" />
                      {toCompanionLabel(course.companionType)}
                    </span>
                  </div>
                  <div className="mt-[12px] flex flex-wrap gap-[4px]">
                    {toContentTagIds(course.tags).map((tag, index) => (
                      <TagChip
                        key={`${tag}-${index}`}
                        type={tag}
                        style={{ height: 26 }}
                      />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          {isFetchingNextPage ? (
            <p className="text-gray-4 mt-[24px] text-center">
              코스를 더 불러오는 중이에요.
            </p>
          ) : null}
          <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
        </section>
      </main>
      <DesktopFooter />
      <CourseDeleteDialog {...dialogProps} />
    </div>
  );
}

export default LocalCourseDesktopPage;
