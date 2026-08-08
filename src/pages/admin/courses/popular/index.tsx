import { useNavigate } from 'react-router-dom';

import { EditableContentCard } from '../../../../components/common';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { mockPopularCourseCards } from '../constants/mockCourseCards';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;

function AdminCoursesPopularPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const handleDeleteCourse = (courseId: string) => {
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
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          인기 추천 코스
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          여행자들이 가장 많이 찾는 추천 코스
        </p>
      </div>

      <div
        className="grid grid-cols-2"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          columnGap: LIST_GAP * scale,
          rowGap: LIST_GAP * scale,
        }}
      >
        {mockPopularCourseCards.map((course) => (
          <EditableContentCard
            key={course.id}
            image={course.image}
            title={course.title}
            firstInfo={course.firstInfo}
            secondInfo={course.secondInfo}
            tags={course.tags}
            className="w-full"
            onClick={() => navigate(`/admin/courses/detail/${course.id}`)}
            onDelete={() => handleDeleteCourse(course.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default AdminCoursesPopularPage;
