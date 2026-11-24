import { toReviewerMetaLabel } from '../../../utils/courseEnumLabels.ts';
import { toEditableImages, toImageUrls } from '../../../utils/reviewCard.ts';

import type { CourseReviewPreview } from '../../../types/review.type';
import type { CourseReview } from '../types/courseDetail';

/** createdAt("2026-11-17T09:30:00")을 "2026.11.17."로 바꾼다. */
function toReviewDate(createdAt: string | undefined): string {
  return createdAt ? `${createdAt.slice(0, 10).replace(/-/g, '.')}.` : '';
}

/** GET /courses/{courseId}/reviews 응답을 후기 카드 데이터로 바꾼다. */
function mapCourseReviewPreview(preview: CourseReviewPreview): CourseReview {
  return {
    id: preview.reviewId,
    images: toImageUrls(preview.images),
    editableImages: toEditableImages(preview.images),
    profileImage: preview.author?.profileImageUrl ?? '',
    nickname: preview.author?.nickname ?? '',
    meta: toReviewerMetaLabel(preview.author?.ageGroup, preview.author?.gender),
    content: preview.content,
    rating: preview.rating,
    isMine: preview.isMine,
    date: toReviewDate(preview.createdAt),
  };
}

export function mapCourseReviewPreviews(
  previews: readonly CourseReviewPreview[] | undefined
): CourseReview[] {
  return (previews ?? []).map(mapCourseReviewPreview);
}
