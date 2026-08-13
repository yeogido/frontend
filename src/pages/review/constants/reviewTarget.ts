export type ReviewTargetType =
  | 'yeogido-course'
  | 'local-recommendation'
  | 'local-course'
  | 'local-business'
  | string;

// 리뷰 작성 API는 추천 코스(GET/POST /courses/{courseId}/reviews)만 지원한다.
const REVIEWABLE_TARGET_TYPES = ['yeogido-course', 'local-course'] as const;

export function isReviewableTargetType(
  targetType: ReviewTargetType
): targetType is (typeof REVIEWABLE_TARGET_TYPES)[number] {
  return REVIEWABLE_TARGET_TYPES.some((type) => type === targetType);
}
