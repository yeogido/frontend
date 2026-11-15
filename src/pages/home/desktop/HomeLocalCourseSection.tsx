import { useNavigate } from 'react-router-dom';

import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useCourses } from '../../../hooks/useCourses';
import { toCourseCardProps } from '../../../utils/courseCard';
import { buildCourseDetailPath } from '../../../utils/routes';
import HomeCourseCard from './HomeCourseCard';
import HomeSectionHeader from './HomeSectionHeader';

const PREVIEW_COUNT = 4;
const SKELETON_HEIGHT = 286;

/** 우리동네 추천 코스 — 인기 코스 4개. */
function HomeLocalCourseSection() {
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { data, isPending, isError } = useCourses({
    courseType: 'LOCAL',
    sort: 'POPULAR',
    size: PREVIEW_COUNT,
  });
  const courses = (data?.pages[0]?.items ?? [])
    .slice(0, PREVIEW_COUNT)
    .map(toCourseCardProps);

  return (
    <section
      aria-label="우리동네 추천 코스"
      className="flex flex-col gap-[20px]"
    >
      <HomeSectionHeader
        title="우리동네 추천 코스"
        onMoreClick={() => navigate('/local-course')}
      />

      {isError ? (
        <p role="alert" className="text-main-5 text-[16px] font-medium">
          코스 목록을 불러오지 못했어요.
        </p>
      ) : (
        <div className="flex gap-[24px]">
          {isPending
            ? Array.from({ length: PREVIEW_COUNT }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  style={{ height: SKELETON_HEIGHT }}
                  className="bg-gray-2 w-[244px] animate-pulse rounded-[12px]"
                />
              ))
            : courses.map((course) => (
                <HomeCourseCard
                  key={course.id}
                  image={course.image}
                  title={course.title}
                  duration={course.duration}
                  courseType={course.courseType}
                  companion={course.companion}
                  tags={course.tags}
                  liked={getLiked(course.id, course.liked)}
                  onClick={() =>
                    navigate(buildCourseDetailPath('LOCAL', course.id))
                  }
                  onLikeClick={() =>
                    toggleLike(course.id, getLiked(course.id, course.liked))
                  }
                />
              ))}
        </div>
      )}
    </section>
  );
}

export default HomeLocalCourseSection;
