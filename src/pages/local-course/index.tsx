import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CourseCard,
  CourseDeleteDialog,
  FloatingActionButton,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useAuthStore } from '../../store/auth.store';
import {
  useCourseDelete,
  usePopularLocalCourses,
} from '../../hooks/useCourses';
import { useCourseLikeToggle } from '../../hooks/useCourseLikeToggle';
import { useEditLocalCourse } from '../../hooks/useEditLocalCourse';
import { useRecentCourses } from '../../hooks/useRecentCourses';
import { toContentTagIds } from '../../utils/contentTags';
import { toCourseCardProps } from '../../utils/courseCard';
import {
  toCompanionLabel,
  toDurationLabel,
} from '../../utils/courseEnumLabels';

import {
  LocalCourseHero,
  PopularCourseCard,
  PopularCourseCardSkeleton,
} from './components';

const PAGE_PADDING_X = 24;
// Figma 검색바 시작점(y=246)에 맞춰 277px 히어로와 31px 겹친다.
const PAGE_PADDING_TOP = -31;
const PAGE_PADDING_BOTTOM = 40;
const SECTION_MARGIN_TOP = 24;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;
const RECENT_COURSE_PREVIEW_COUNT = 2;
const POPULAR_DOT_GAP = 4;
const POPULAR_DOT_SIZE = 4;
const POPULAR_DOT_ACTIVE_WIDTH = 20;
const POPULAR_DOT_RADIUS = 100;

/** createdAt("2026-07-26T15:30:00" 등)을 "2026.07.26"로 바꾼다. */
function formatCourseCreatedAt(createdAt: string): string {
  return createdAt.slice(0, 10).replace(/-/g, '.');
}

function LocalCoursePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { editLocalCourse } = useEditLocalCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const {
    data: popularCourses,
    isPending: isPopularCoursesPending,
    isError: isPopularCoursesError,
    refetch: refetchPopularCourses,
  } = usePopularLocalCourses();
  const popularCoursePreviews = popularCourses ?? [];

  const popularScrollRef = useRef<HTMLDivElement>(null);
  const [popularActiveIndex, setPopularActiveIndex] = useState(0);

  useEffect(() => {
    const container = popularScrollRef.current;

    if (!container) {
      return;
    }

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const itemWidth = container.clientWidth;

        if (itemWidth === 0) {
          return;
        }

        const index = Math.round(
          container.scrollLeft / (itemWidth + LIST_GAP * scale)
        );
        setPopularActiveIndex(index);
      });
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scale]);

  const scrollPopularToIndex = (index: number) => {
    const container = popularScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      left: (container.clientWidth + LIST_GAP * scale) * index,
      behavior: 'smooth',
    });
  };

  const recentCoursePreviews = useRecentCourses()
    .filter((course) => course.courseType === 'LOCAL')
    .slice(0, RECENT_COURSE_PREVIEW_COUNT)
    .map(toCourseCardProps);

  const goToRegionSearch = () => {
    navigate('/course-region-search?from=local-course');
  };

  const goToCreateCourse = () => {
    navigate('/local-recommendation');
  };

  const handleCreateCourse = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    goToCreateCourse();
  };

  const goToPopularCourses = () => {
    navigate('/local-course/popular');
  };

  const goToRecentCourses = () => {
    navigate('/local-course/recent');
  };

  const goToCourseDetail = (courseId: number) => {
    navigate(`/local-course/detail/${courseId}`);
  };

  return (
    <>
      <LocalCourseHero onCreateClick={handleCreateCourse} />

      <section
        className="relative mx-auto flex min-h-screen w-full flex-col"
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
          // paddingTop은 음수를 못 받아 marginTop으로 곡선 아래쪽에 겹치게
          // 끌어올린다(padding은 CSS 스펙상 음수가 무시되고 0으로 clamp됨).
          marginTop: PAGE_PADDING_TOP * scale,
          paddingBottom: PAGE_PADDING_BOTTOM * scale,
        }}
      >
        <SearchTriggerButton
          label="지역명 또는 도시명 검색 화면으로 이동"
          placeholder="지역명 또는 도시명을 검색해 주세요"
          onClick={goToRegionSearch}
        />

        <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
          <SectionHeader
            title="인기 추천 코스"
            actionText="전체 보기"
            onActionClick={goToPopularCourses}
          />

          <div
            ref={popularScrollRef}
            className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              gap: LIST_GAP * scale,
            }}
          >
            {isPopularCoursesPending
              ? Array.from({ length: 1 }, (_, index) => (
                  <div
                    key={index}
                    className="w-full shrink-0 snap-start snap-always"
                  >
                    <PopularCourseCardSkeleton />
                  </div>
                ))
              : popularCoursePreviews.map((course) => {
                  const isMine = course.canManage;

                  return (
                    <div
                      key={course.courseId}
                      className="w-full shrink-0 snap-start snap-always"
                    >
                      <PopularCourseCard
                        authorAvatarUrl={course.author.profileImageUrl}
                        authorName={course.author.nickname}
                        date={formatCourseCreatedAt(course.createdAt)}
                        image={
                          course.routeImageUrl?.trim() || course.thumbnailUrl
                        }
                        title={course.title}
                        duration={toDurationLabel(course.durationType)}
                        companion={toCompanionLabel(course.companionType)}
                        tags={toContentTagIds(course.tags)}
                        liked={getLiked(course.courseId, course.isLiked)}
                        isMine={isMine}
                        onClick={() => goToCourseDetail(course.courseId)}
                        onLikeClick={() =>
                          toggleLike(
                            course.courseId,
                            getLiked(course.courseId, course.isLiked)
                          )
                        }
                        onEditClick={() =>
                          void editLocalCourse(course.courseId)
                        }
                        onDeleteClick={() => requestDelete(course.courseId)}
                      />
                    </div>
                  );
                })}
          </div>

          {!isPopularCoursesPending && popularCoursePreviews.length > 1 ? (
            <div
              className="flex items-center justify-center"
              style={{
                marginTop: LIST_MARGIN_TOP * scale,
                gap: POPULAR_DOT_GAP * scale,
              }}
            >
              {popularCoursePreviews.map((course, index) => (
                <button
                  key={course.courseId}
                  type="button"
                  aria-label={`${index + 1}번째 코스로 이동`}
                  aria-current={index === popularActiveIndex}
                  onClick={() => scrollPopularToIndex(index)}
                  className="shrink-0"
                  style={{
                    width:
                      (index === popularActiveIndex
                        ? POPULAR_DOT_ACTIVE_WIDTH
                        : POPULAR_DOT_SIZE) * scale,
                    height: POPULAR_DOT_SIZE * scale,
                    borderRadius: POPULAR_DOT_RADIUS,
                    backgroundColor:
                      index === popularActiveIndex ? '#FF6F41' : '#A1A1A1',
                    transition: 'width 0.2s ease, background-color 0.2s ease',
                  }}
                />
              ))}
            </div>
          ) : null}

          {!isPopularCoursesPending && isPopularCoursesError ? (
            <div
              className="flex flex-col items-center"
              style={{
                marginTop: ERROR_MARGIN_TOP * scale,
                gap: ERROR_MARGIN_TOP * scale,
              }}
            >
              <p
                className="text-main-5 text-center font-medium"
                style={{ fontSize: ERROR_TEXT_SIZE * scale }}
              >
                코스 목록을 불러오지 못했어요.
              </p>
              <button
                type="button"
                onClick={() => void refetchPopularCourses()}
                className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
              >
                다시 시도
              </button>
            </div>
          ) : null}
        </section>

        {recentCoursePreviews.length > 0 ? (
          <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
            <SectionHeader
              title="최근 본 코스"
              actionText="전체 보기"
              onActionClick={goToRecentCourses}
            />

            <div
              className="grid grid-cols-1"
              style={{
                marginTop: LIST_MARGIN_TOP * scale,
                gap: LIST_GAP * scale,
              }}
            >
              {recentCoursePreviews.map((course) => (
                <div key={course.id} className="w-full">
                  <CourseCard
                    {...course}
                    liked={getLiked(course.id, course.liked)}
                    canManage={course.canManage}
                    showEdit
                    onClick={() => goToCourseDetail(course.id)}
                    onLikeClick={() =>
                      toggleLike(course.id, getLiked(course.id, course.liked))
                    }
                    onEditClick={() => void editLocalCourse(course.id)}
                    onDeleteClick={() => requestDelete(course.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <FloatingActionButton
          ariaLabel="코스 만들기"
          onClick={handleCreateCourse}
        />
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default LocalCoursePage;
