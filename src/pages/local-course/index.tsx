import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseCard,
  CourseDeleteDialog,
  EditableContentCard,
  FloatingActionButton,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useAuthStore } from '../../store/auth.store';
import {
  useCourseDelete,
  useCourses,
  useMyCourseIds,
} from '../../hooks/useCourses';
import { useCourseLikeToggle } from '../../hooks/useCourseLikeToggle';
import { useEditLocalCourse } from '../../hooks/useEditLocalCourse';
import { useRecentCourses } from '../../hooks/useRecentCourses';
import { toContentTagIds } from '../../utils/contentTags';
import { toCourseCardProps } from '../../utils/courseCard';
import type { CourseDurationType } from '../../types/course.type';

import { CreateCourseBanner } from './components';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 12;
const BANNER_MARGIN_TOP = 12;
const SECTION_MARGIN_TOP = 32;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;
const POPULAR_COURSE_PREVIEW_COUNT = 2;
const RECENT_COURSE_PREVIEW_COUNT = 2;

const durationLabelByType: Record<CourseDurationType, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  TWO_NIGHT: '2박 3일',
  THREE_PLUS: '3박 이상',
};

function LocalCoursePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const myCourseIds = useMyCourseIds();
  const { editLocalCourse } = useEditLocalCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const {
    data: popularCourses,
    isPending: isPopularCoursesPending,
    isError: isPopularCoursesError,
    refetch: refetchPopularCourses,
  } = useCourses({
    courseType: 'LOCAL',
    sort: 'LATEST',
    size: POPULAR_COURSE_PREVIEW_COUNT,
  });
  const popularCoursePreviews = (popularCourses?.pages[0]?.items ?? []).slice(
    0,
    POPULAR_COURSE_PREVIEW_COUNT
  );
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
            우리동네 추천 코스
          </h1>
          <p
            className="text-gray-4 font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            여행자들이 직접 만든 지역 경험 코스
          </p>
        </div>

        <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
          <SearchTriggerButton
            label="지역명 또는 도시명 검색 화면으로 이동"
            placeholder="지역명 또는 도시명을 검색해 주세요"
            onClick={goToRegionSearch}
          />
        </div>

        <div style={{ marginTop: BANNER_MARGIN_TOP * scale }}>
          <CreateCourseBanner onClick={goToCreateCourse} />
        </div>

        <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
          <SectionHeader
            title="인기 추천 코스"
            actionText="자세히 보기"
            onActionClick={goToPopularCourses}
          />

          <div
            className="flex [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              gap: LIST_GAP * scale,
            }}
          >
            {isPopularCoursesPending
              ? Array.from(
                  { length: POPULAR_COURSE_PREVIEW_COUNT },
                  (_, index) => <ContentCardSkeleton key={index} />
                )
              : popularCoursePreviews.map((course) =>
                  myCourseIds.has(course.courseId) ? (
                    <EditableContentCard
                      key={course.courseId}
                      image={course.thumbnailUrl}
                      title={course.title}
                      firstInfo={durationLabelByType[course.durationType]}
                      secondInfo={course.region}
                      tags={toContentTagIds(course.tags)}
                      onClick={() => goToCourseDetail(course.courseId)}
                      onEdit={() => void editLocalCourse(course.courseId)}
                      onDelete={() => requestDelete(course.courseId)}
                    />
                  ) : (
                    <ContentCard
                      key={course.courseId}
                      image={course.thumbnailUrl}
                      title={course.title}
                      firstInfo={durationLabelByType[course.durationType]}
                      secondInfo={course.region}
                      tags={toContentTagIds(course.tags)}
                      liked={getLiked(course.courseId, course.isLiked)}
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
          </div>

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
                    isMine={myCourseIds.has(course.id)}
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
