import { ReviewCard, SectionHeader } from '../../../components/common';

import type { CourseReview } from '../types/course';

interface CourseReviewSectionProps {
  reviews: CourseReview[];
}

function CourseReviewSection({ reviews }: CourseReviewSectionProps) {
  return (
    <section className="bg-white px-5 sm:px-6 lg:px-8">
      <SectionHeader title="코스 리뷰" actionText="전체 보기" />

      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1 min-[360px]:gap-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            profileImage={review.profileImage}
            nickname={review.nickname}
            meta={review.meta}
            content={review.content}
            rating={review.rating}
            className="snap-start lg:w-full"
          />
        ))}
      </div>
    </section>
  );
}

export default CourseReviewSection;
