import {
  toCompanionLabel,
  toDurationLabel,
  toReviewerMetaLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import { toContentTagIds } from '../../../utils/contentTags';

import type { MyCourseSummary, MyReview } from '../../../types/user.type';

/**
 * 내 게시물의 리뷰 항목을 CourseReviewCard props로 바꾼다.
 *
 * /recent-review-courses의 toReviewCourseCardProps(utils/reviewCard.ts)와
 * 같은 방식이다. course 정보가 아직 안 내려오는 리뷰는 빈 값으로 두고,
 * CourseReviewCard가 값이 없는 항목을 알아서 건너뛴다.
 */
export function toMyPostReviewCardProps(
  review: MyReview,
  fallbackCourse?: MyCourseSummary,
) {
  const course = review.course ?? fallbackCourse;

  return {
    id: review.reviewId,
    courseId: course?.id,
    image: course?.thumbnailUrl ?? '',
    title: course?.title ?? '',
    duration: course ? toDurationLabel(course.durationType) : '',
    courseType: course ? toTransportLabel(course.transportType) : '',
    companion: course ? toCompanionLabel(course.companionType) : undefined,
    tags: course ? toContentTagIds(course.hashtags) : undefined,
    profileImage: review.reviewerProfileImage,
    nickname: review.reviewerName,
    meta: toReviewerMetaLabel(review.ageGroup, review.gender),
    content: review.content,
    rating: review.rating,
  };
}
