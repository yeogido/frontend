import { useNavigate } from 'react-router-dom';

import {
  CourseCard,
  CourseCardSkeleton,
  CourseDeleteDialog,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCourseDelete, useCourses } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useEditCourse } from '../../../hooks/useEditCourse';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import { toCourseCardProps } from '../../../utils/courseCard';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;
const COURSE_PREVIEW_COUNT = 2;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;

function CourseSection() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const isAdmin = useIsAdmin();
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const { data, isPending, isError } = useCourses({
    courseType: 'OFFICIAL',
    sort: 'RECOMMEND',
    size: COURSE_PREVIEW_COUNT,
  });

  const courses = (data?.pages[0]?.items ?? [])
    .slice(0, COURSE_PREVIEW_COUNT)
    .map(toCourseCardProps);

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
            title="여기도 추천 코스"
            actionText="전체보기"
            onActionClick={() => navigate('/yeogido-course/')}
          />
        </div>

        <div
          className="flex flex-col"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            gap: CARD_GAP * scale,
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          {isPending ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : (
            <>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  {...course}
                  liked={getLiked(course.id, course.liked)}
                  canManage={isAdmin}
                  showEdit
                  onClick={() =>
                    navigate(`/yeogido-course/detail/${course.id}`)
                  }
                  onLikeClick={() =>
                    toggleLike(course.id, getLiked(course.id, course.liked))
                  }
                  onEditClick={() => void editCourse(course.id)}
                  onDeleteClick={() => requestDelete(course.id)}
                />
              ))}
            </>
          )}
        </div>

        {!isPending && isError ? (
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
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default CourseSection;
