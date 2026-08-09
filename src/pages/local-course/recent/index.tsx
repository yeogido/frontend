import { useNavigate } from 'react-router-dom';

import { CourseCard, CourseDeleteDialog } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCourseDelete, useMyCourseIds } from '../../../hooks/useCourses';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import { useRecentCourses } from '../../../hooks/useRecentCourses';
import { toCourseCardProps } from '../../../utils/courseCard';

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

function LocalCourseRecentPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { courseIds: myCourseIds } = useMyCourseIds();
  const { editLocalCourse } = useEditLocalCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const handleCourseClick = (courseId: number | string) => {
    navigate(`/local-course/detail/${courseId}`);
  };

  const recentCourses = useRecentCourses()
    .filter((course) => course.courseType === 'LOCAL')
    .map(toCourseCardProps);

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
            최근 확인한 동네 코스를 다시 둘러보세요
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
                isMine={myCourseIds.has(course.id)}
                showEdit
                onClick={() => handleCourseClick(course.id)}
                onLikeClick={() =>
                  toggleLike(course.id, getLiked(course.id, course.liked))
                }
                onEditClick={() => void editLocalCourse(course.id)}
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

export default LocalCourseRecentPage;
