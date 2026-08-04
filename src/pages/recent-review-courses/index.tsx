import { useState } from 'react';

import CourseReviewCard from '../../components/common/CourseReviewCard';
import { useGlobalScale } from '../../hooks/useGlobalScale';

import { recentReviewCourses } from './recentReviewCourses';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 30;
const LIST_GAP = 16;

function RecentReviewCoursesPage() {
  const scale = useGlobalScale();
  const [likedCourseIds, setLikedCourseIds] = useState<string[]>([]);

  const handleLikeClick = (courseId: string, liked: boolean) => {
    setLikedCourseIds((currentIds) =>
      liked
        ? currentIds.filter((id) => id !== courseId)
        : [...currentIds, courseId]
    );
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
          className="font-semibold text-[#1C1C1C]"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          최근 후기
        </h1>
        <p
          className="font-normal text-[#505050]"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          최근 등록된 여행 후기를 모아봤어요
        </p>
      </div>

      <div
        className="flex flex-col"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          gap: LIST_GAP * scale,
        }}
      >
        {recentReviewCourses.map(({ id, liked, ...courseReview }) => {
          const initialLiked = liked ?? false;
          const isLiked = likedCourseIds.includes(id)
            ? !initialLiked
            : initialLiked;

          return (
            <CourseReviewCard
              key={id}
              {...courseReview}
              liked={isLiked}
              onLikeClick={() => handleLikeClick(id, isLiked)}
            />
          );
        })}
      </div>
    </section>
  );
}

export default RecentReviewCoursesPage;
