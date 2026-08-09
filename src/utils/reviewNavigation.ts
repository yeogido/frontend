import type { ReviewDetailModalReview } from '../components/common/ReviewDetailModal';

/**
 * 후기 카드를 눌러 코스 상세로 갈 때, 띄울 후기를 함께 넘기는 값.
 *
 * 코스 상세는 후기를 최신 4개만 읽어서(useCourseReviewPreviews) id만 넘기면
 * 그 안에 없는 후기는 못 연다. 카드가 이미 모달에 필요한 값을 다 들고 있으므로
 * 그대로 넘겨 추가 조회 없이 띄운다.
 */
export interface CourseDetailNavigationState {
  openedReview: ReviewDetailModalReview;
}

export function toCourseDetailState(
  review: ReviewDetailModalReview
): CourseDetailNavigationState {
  return {
    openedReview: {
      images: review.images,
      content: review.content,
      profileImage: review.profileImage,
      nickname: review.nickname,
      meta: review.meta,
      rating: review.rating,
    },
  };
}

/**
 * history state에서 띄울 후기를 읽는다.
 *
 * state는 뒤로가기·새로고침을 거치며 남거나 사라지고 사용자가 조작할 수도
 * 있어서, 모양을 확인한 뒤에만 쓴다.
 */
export function readOpenedReview(
  state: unknown
): ReviewDetailModalReview | undefined {
  if (typeof state !== 'object' || state === null) {
    return undefined;
  }

  const { openedReview } = state as Partial<CourseDetailNavigationState>;

  if (
    typeof openedReview !== 'object' ||
    openedReview === null ||
    typeof openedReview.content !== 'string' ||
    typeof openedReview.nickname !== 'string'
  ) {
    return undefined;
  }

  return openedReview;
}
