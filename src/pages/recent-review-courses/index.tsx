import CourseReviewCard from '../../components/common/CourseReviewCard';

import { recentReviewCourses } from './recentReviewCourses';

function RecentReviewCoursesPage() {
  return (
    <section className="px-6 pt-6 pb-8">
      <div className="flex flex-col gap-[6px]">
        <h1 className="text-[18px] leading-none font-semibold text-[#1C1C1C]">
          최근 후기
        </h1>
        <p className="text-[14px] leading-none font-normal text-[#505050]">
          최근 등록된 여행 후기를 모아봤어요
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        {recentReviewCourses.map(({ id, ...courseReview }) => (
          <CourseReviewCard key={id} {...courseReview} />
        ))}
      </div>
    </section>
  );
}

export default RecentReviewCoursesPage;
