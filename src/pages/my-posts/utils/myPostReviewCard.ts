import {
  toCompanionLabel,
  toDurationLabel,
  toReviewerMetaLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels.ts';
import { toContentTagIds } from '../../../utils/contentTags.ts';
import { toEditableImages, toImageUrls } from '../../../utils/reviewCard.ts';

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
  const images = toImageUrls(review.images);

  return {
    id: review.reviewId,
    courseId: course?.id,
    // 다른 화면과 같이 카드 썸네일은 후기 사진의 첫 장으로 쓴다. 사진 없이 쓴
    // 후기도 있어(서버가 0장을 허용한다) 그때는 코스 썸네일로 떨어뜨린다.
    image: images[0] ?? course?.thumbnailUrl ?? '',
    images,
    editableImages: toEditableImages(review.images),
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
