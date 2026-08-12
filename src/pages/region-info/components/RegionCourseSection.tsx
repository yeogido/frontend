import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseDeleteDialog,
  EditableContentCard,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  useCourseDelete,
  useCourses,
  useMyCourseIds,
} from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useEditCourse } from '../../../hooks/useEditCourse';
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import { toContentTagIds } from '../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import { buildCourseDetailPath } from '../../../utils/routes';
import type { CourseSort, CourseType } from '../../../types/course.type';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;
const REGION_COURSE_PREVIEW_COUNT = 2;
const RETRY_BUTTON_FONT_SIZE = 14;
const RETRY_BUTTON_PADDING_X = 16;
const RETRY_BUTTON_PADDING_Y = 8;
const LIST_SCROLL_PADDING_BOTTOM = 8;

// LOCAL 코스는 추천순(RECOMMEND) 정렬을 지원하지 않아(COURSE4008) 최신순으로
// 대체한다 - /yeogido-course, /local-course 홈 화면의 "인기 추천 코스"
// 섹션과 동일한 정렬 기준.
const SORT_BY_COURSE_TYPE: Record<CourseType, CourseSort> = {
  OFFICIAL: 'RECOMMEND',
  LOCAL: 'LATEST',
};

interface RegionCourseSectionProps {
  regionName: string;
  regionId?: number;
  isRegionLoading?: boolean;
  courseType: CourseType;
  title: string;
  searchPath: string;
}

function RegionCourseSection({
  regionName,
  regionId,
  isRegionLoading = false,
  courseType,
  title,
  searchPath,
}: RegionCourseSectionProps) {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const isAdmin = useIsAdmin();
  const { editCourse } = useEditCourse();
  const { editLocalCourse } = useEditLocalCourse();
  const { requestDelete, dialogProps } = useCourseDelete();
  const { courseIds: myCourseIds, isPending: isMyCourseIdsPending } =
    useMyCourseIds();
  const handleEditCourse = (courseId: number) =>
    void (courseType === 'OFFICIAL'
      ? editCourse(courseId)
      : editLocalCourse(courseId));
  // OFFICIAL 코스는 관리자만 만들 수 있어 소유자 개념이 없다. LOCAL 코스는
  // 일반 사용자도 본인이 쓴 것을 여기서 바로 수정할 수 있어야 한다 —
  // /local-course/search·/local-course/popular와 동일한 조건.
  const canManageCourse = (courseId: number) =>
    isAdmin || (courseType === 'LOCAL' && myCourseIds.has(courseId));

  // regionId를 찾지 못한 지역(예: /regions 목록에 없는 지역)은 regionId 필터
  // 대신 지역명을 키워드로 검색해 대체한다. 지역 목록이 아직 로딩 중일 때는
  // 대기시켜, regionId 미확정 상태에서 키워드 검색이 먼저 떴다가 지역
  // 필터로 바뀌는 깜빡임을 막는다.
  const { data, isPending, isError, refetch } = useCourses(
    {
      courseType,
      regionId,
      keyword: regionId === undefined ? regionName : undefined,
      sort: SORT_BY_COURSE_TYPE[courseType],
      size: REGION_COURSE_PREVIEW_COUNT,
    },
    { enabled: !isRegionLoading }
  );

  const courses = data?.pages[0]?.items ?? [];

  return (
    <>
      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <div
          style={{
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          <SectionHeader
            title={title}
            actionText="전체보기"
            onActionClick={() =>
              navigate(
                `${searchPath}?${new URLSearchParams({ region: regionName }).toString()}`
              )
            }
          />
        </div>

        <div
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          <div
            className="overflow-x-auto"
            style={{ paddingBottom: LIST_SCROLL_PADDING_BOTTOM * scale }}
          >
            <div className="flex min-w-max" style={{ gap: CARD_GAP * scale }}>
              {isPending || isMyCourseIdsPending
                ? Array.from(
                    { length: REGION_COURSE_PREVIEW_COUNT },
                    (_, index) => <ContentCardSkeleton key={index} />
                  )
                : courses.map((course) =>
                    canManageCourse(course.courseId) ? (
                      <EditableContentCard
                        key={course.courseId}
                        image={course.routeImageUrl?.trim() || course.thumbnailUrl}
                        title={course.title}
                        firstInfo={toDurationLabel(course.durationType)}
                        secondInfo={toTransportLabel(course.transportType)}
                        thirdInfo={toCompanionLabel(course.companionType)}
                        tags={toContentTagIds(course.tags)}
                        onClick={() =>
                          navigate(
                            buildCourseDetailPath(courseType, course.courseId)
                          )
                        }
                        onEdit={() => handleEditCourse(course.courseId)}
                        onDelete={() => requestDelete(course.courseId)}
                      />
                    ) : (
                      <ContentCard
                        key={course.courseId}
                        image={course.routeImageUrl?.trim() || course.thumbnailUrl}
                        title={course.title}
                        firstInfo={toDurationLabel(course.durationType)}
                        secondInfo={toTransportLabel(course.transportType)}
                        thirdInfo={toCompanionLabel(course.companionType)}
                        tags={toContentTagIds(course.tags)}
                        liked={getLiked(course.courseId, course.isLiked)}
                        onClick={() =>
                          navigate(
                            buildCourseDetailPath(courseType, course.courseId)
                          )
                        }
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
          </div>

          {!isPending && isError ? (
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
                코스를 불러오지 못했어요.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-full border border-[#e4e4e4] font-medium text-[#505050]"
                style={{
                  fontSize: RETRY_BUTTON_FONT_SIZE * scale,
                  paddingLeft: RETRY_BUTTON_PADDING_X * scale,
                  paddingRight: RETRY_BUTTON_PADDING_X * scale,
                  paddingTop: RETRY_BUTTON_PADDING_Y * scale,
                  paddingBottom: RETRY_BUTTON_PADDING_Y * scale,
                }}
              >
                다시 시도
              </button>
            </div>
          ) : null}

          {!isPending && !isError && courses.length === 0 ? (
            <p
              className="text-gray-4 text-center font-medium"
              style={{
                marginTop: ERROR_MARGIN_TOP * scale,
                fontSize: ERROR_TEXT_SIZE * scale,
              }}
            >
              등록된 코스가 없습니다.
            </p>
          ) : null}
        </div>
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default RegionCourseSection;
