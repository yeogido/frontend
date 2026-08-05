import { toReviewerMetaLabel } from '../../../utils/courseEnumLabels.ts';

import type { CourseReviewPreview } from '../../../types/review.type';
import type { CourseReview } from '../types/courseDetail';

/**
 * GET /courses/{courseId}/reviews 응답을 후기 카드 데이터로 바꾼다.
 *
 * 응답에 작성자 식별자가 없어 본인 여부를 알 수 없다(닉네임 비교는 동명이인에서
 * 틀린다). 그래서 내 리뷰 ID 집합을 밖에서 받아 대조한다 — useMyReviewIds 참고.
 * 백엔드가 isMine을 내려주면 이 인자를 걷어내면 된다.
 */
function mapCourseReviewPreview(
  preview: CourseReviewPreview,
  myReviewIds: ReadonlySet<number> = new Set()
): CourseReview {
  return {
    id: preview.reviewId,
    images: preview.imageUrls ?? [],
    profileImage: preview.author?.profileImageUrl ?? '',
    nickname: preview.author?.nickname ?? '',
    meta: toReviewerMetaLabel(preview.author?.ageGroup, preview.author?.gender),
    content: preview.content,
    rating: preview.rating,
    isMine: myReviewIds.has(preview.reviewId),
  };
}

export function mapCourseReviewPreviews(
  previews: readonly CourseReviewPreview[] | undefined,
  myReviewIds: ReadonlySet<number> = new Set()
): CourseReview[] {
  return (previews ?? []).map((preview) =>
    mapCourseReviewPreview(preview, myReviewIds)
  );
}
