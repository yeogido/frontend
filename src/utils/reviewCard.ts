import {
  toDurationLabel,
  toReviewerMetaLabel,
  toTransportLabel,
} from './courseEnumLabels.ts';

import type {
  RecentReview,
  ReviewDetail,
  ReviewImage,
} from '../types/review.type';

// 응답이 순서대로 온다는 보장이 없어 imageOrder로 정렬한 뒤 URL만 추린다.
function toImageUrls(images: ReviewImage[] | undefined): string[] {
  return [...(images ?? [])]
    .sort((a, b) => a.imageOrder - b.imageOrder)
    .map((image) => image.imageUrl)
    .filter(Boolean);
}

/**
 * 최근 후기를 ReviewCard props로 바꾼다.
 *
 * 응답에 작성자 식별자가 없어 본인 여부는 내 리뷰 ID 집합과 대조해서 정한다
 * (useMyReviewIds 참고). 백엔드가 isMine을 내려주면 인자를 걷어내면 된다.
 */
export function toReviewCardProps(
  review: RecentReview | ReviewDetail,
  myReviewIds: ReadonlySet<number> = new Set()
) {
  const courseTitle = 'course' in review ? review.course.title : undefined;

  return {
    id: review.reviewId,
    images: toImageUrls(review.images),
    profileImage: review.author?.profileImageUrl ?? '',
    nickname: review.author?.nickname ?? '',
    meta: toReviewerMetaLabel(review.author?.ageGroup, review.author?.gender),
    content: review.content,
    rating: review.rating,
    isMine: myReviewIds.has(review.reviewId),
    ...(courseTitle ? { courseTitle } : {}),
  };
}

/**
 * 후기 + 코스 정보를 CourseReviewCard props로 바꾼다.
 *
 * 코스의 동행(companion)과 해시태그(tags)는 리뷰 목록 API가 내려주지 않아
 * 비워 둔다. 카드가 값이 없는 항목을 건너뛰므로 화면은 깨지지 않는다.
 */
export function toReviewCourseCardProps(
  review: ReviewDetail,
  myReviewIds: ReadonlySet<number> = new Set()
) {
  return {
    id: review.reviewId,
    courseId: review.course.courseId,
    isMine: myReviewIds.has(review.reviewId),
    // 카드에 그리는 건 코스 썸네일(image)이고, 후기 사진(images)은 길게 눌러
    // 여는 상세 모달에서 쓴다.
    image: review.course.thumbnailUrl,
    images: toImageUrls(review.images),
    title: review.course.title,
    duration: toDurationLabel(review.course.durationType),
    courseType: toTransportLabel(review.course.transportType),
    profileImage: review.author?.profileImageUrl ?? '',
    nickname: review.author?.nickname ?? '',
    meta: toReviewerMetaLabel(review.author?.ageGroup, review.author?.gender),
    content: review.content,
    rating: review.rating,
    liked: review.course.isLiked,
  };
}
