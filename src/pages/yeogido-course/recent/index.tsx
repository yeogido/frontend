import { useNavigate } from 'react-router-dom';

import { CourseCard, CourseDeleteDialog } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCourseDelete } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useEditCourse } from '../../../hooks/useEditCourse';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import { useRecentCourses } from '../../../hooks/useRecentCourses';

import { toRecentCourseCardProps } from './constants/recentCourses';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const LIST_MARGIN_TOP = 30;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const MESSAGE_TEXT_SIZE = 13;

function YeogidoCourseRecentPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const isAdmin = useIsAdmin();
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const handleCourseClick = (courseId: number | string) => {
    navigate(`/yeogido-course/detail/${courseId}`);
  };

  const recentCourses = useRecentCourses()
    .filter((course) => course.courseType === 'OFFICIAL')
    .map(toRecentCourseCardProps);

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
            className="leading-none font-semibold text-black"
            style={{ fontSize: TITLE_SIZE * scale }}
          >
            최근 본 코스
          </h1>
          <p
            className="text-gray-5 leading-none font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
            }}
          >
            최근 확인한 코스를 다시 둘러보세요
          </p>
        </div>

        {recentCourses.length > 0 ? (
          <div
            className="flex flex-col"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              gap: LIST_GAP * scale,
            }}
          >
            {recentCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                liked={getLiked(course.id, course.liked)}
                canManage={isAdmin}
                showEdit
                onClick={() => handleCourseClick(course.id)}
                onLikeClick={() =>
                  toggleLike(course.id, getLiked(course.id, course.liked))
                }
                onEditClick={() => void editCourse(course.id)}
                onDeleteClick={() => requestDelete(course.id)}
              />
            ))}
          </div>
        ) : (
          <p
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: EMPTY_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            최근 본 코스가 없습니다.
          </p>
        )}
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default YeogidoCourseRecentPage;
