import { ReviewCard, SectionHeader } from '../../../components/common';
import type { CourseReview } from '../../../features/course-detail/types/courseDetail';

interface CourseReviewSectionProps {
  readonly reviews: readonly CourseReview[];
  readonly className?: string;
}

export function CourseReviewSection({
  reviews,
  className = '',
}: CourseReviewSectionProps) {
  return (
    <section className={`bg-white ${className}`}>
      <SectionHeader title="최근 여행자들의 후기" actionText="전체보기" />

      <div className="scrollbar-hide mt-3.5 flex snap-x gap-3 overflow-x-auto pb-1">
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
