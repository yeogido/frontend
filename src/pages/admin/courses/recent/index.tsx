import { useNavigate } from 'react-router-dom';

import { EditableCourseCard } from '../../../../components/common';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
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

  const goToCourseDetail = (courseId: number) => {
    navigate(buildCourseDetailPath('OFFICIAL', courseId));
  };

  const handleDeleteCourse = (courseId: number) => {
    console.log('코스 삭제:', courseId);
  };

  return (
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
          className="font-semibold leading-none text-black"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          최근 본 코스
        </h1>
        <p
          className="text-gray-5 font-normal leading-none"
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
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
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
              onDelete={() => handleDeleteCourse(course.id)}
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
  );
}

export default AdminCoursesRecentPage;
