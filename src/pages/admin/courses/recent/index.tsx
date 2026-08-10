import { useNavigate } from 'react-router-dom';

import {
  ConfirmDialog,
  EditableCourseCard,
} from '../../../../components/common';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useCourseDelete } from '../../../../hooks/useCourses';
import { useEditCourse } from '../../../../hooks/useEditCourse';
import { useRecentCourses } from '../../../../hooks/useRecentCourses';
import { toCourseCardProps } from '../../../../utils/courseCard';
import { buildCourseDetailPath } from '../../../../utils/routes';

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

function AdminCoursesRecentPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const recentCourses = useRecentCourses()
    .filter((course) => course.courseType === 'OFFICIAL')
    .map(toCourseCardProps);
  const { editCourse } = useEditCourse();
  const { requestDelete, dialogProps } = useCourseDelete();

  const goToCourseDetail = (courseId: number) => {
    navigate(buildCourseDetailPath('OFFICIAL', courseId));
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
              <EditableCourseCard
                key={course.id}
                image={course.image}
                title={course.title}
                duration={course.duration}
                courseType={course.courseType}
                companion={course.companion}
                tags={course.tags}
                onClick={() => goToCourseDetail(course.id)}
                onEdit={() => void editCourse(course.id)}
                onDelete={() => requestDelete(course.id)}
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
      <ConfirmDialog
        {...dialogProps}
        title="코스를 삭제할까요?"
        description="삭제한 코스는 되돌릴 수 없어요."
      />
    </>
  );
}

export default AdminCoursesRecentPage;
