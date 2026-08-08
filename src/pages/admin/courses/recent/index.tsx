import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CourseCard } from '../../../../components/common';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { mockRecentCourseCards } from '../constants/mockCourseCards';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const LIST_MARGIN_TOP = 30;
const LIST_GAP = 16;

function AdminCoursesRecentPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [likedCourseIds, setLikedCourseIds] = useState<Set<string>>(
    () => new Set()
  );

  const toggleLike = (courseId: string) => {
    setLikedCourseIds((current) => {
      const next = new Set(current);

      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }

      return next;
    });
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

      <div
        className="flex flex-col"
        style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
      >
        {mockRecentCourseCards.map((course) => (
          <CourseCard
            key={course.id}
            image={course.image}
            title={course.title}
            duration={course.duration}
            courseType={course.courseType}
            companion={course.companion}
            tags={course.tags}
            liked={likedCourseIds.has(course.id)}
            onClick={() => navigate(`/admin/courses/detail/${course.id}`)}
            onLikeClick={() => toggleLike(course.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default AdminCoursesRecentPage;
