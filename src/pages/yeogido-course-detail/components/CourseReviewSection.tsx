import { ReviewCard, SectionHeader } from '../../../components/common';

import type { CourseReview } from '../types/course';

interface CourseReviewSectionProps {
  reviews: CourseReview[];
}

function CourseReviewSection({ reviews }: CourseReviewSectionProps) {
  return (
    <section className="bg-white px-5">
      <SectionHeader title="코스 리뷰" actionText="전체 보기" />

      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            profileImage={review.profileImage}
            nickname={review.nickname}
            meta={review.meta}
            content={review.content}
            rating={review.rating}
            className="snap-start"
          />
        ))}
      </div>
    </section>
  );
}

export default CourseReviewSection;
