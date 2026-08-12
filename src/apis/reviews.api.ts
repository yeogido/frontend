import { apiClient, normalizeApiError } from './common';

import type {
  CreateCourseReviewRequest,
  CreateCourseReviewResponse,
  GetCourseReviewsParams,
  GetCourseReviewsResponse,
  GetReviewsParams,
  GetReviewsResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
} from '../types/review.type';

export async function getReviews(
  params: GetReviewsParams = {},
): Promise<GetReviewsResponse> {
  try {
    const { data } = await apiClient.get<GetReviewsResponse>('/reviews', {
      params,
    });

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * 코스별 리뷰 목록.
 *
 * 전체 후기 목록(GET /reviews)이 cursor 하나만 받는 것과 달리, 여기는
 * cursorValue와 cursorId를 함께 받는다. RATING 정렬에서 별점이 같은 리뷰가
 * 이어지도록 reviewId를 보조 기준으로 쓰기 때문이다.
 */
export async function getCourseReviews(
  courseId: number,
  params: GetCourseReviewsParams = {},
): Promise<GetCourseReviewsResponse> {
  try {
    const { data } = await apiClient.get<GetCourseReviewsResponse>(
      `/courses/${courseId}/reviews`,
      { params },
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createCourseReview(
  courseId: number,
  request: CreateCourseReviewRequest,
): Promise<CreateCourseReviewResponse> {
  try {
    const { data } = await apiClient.post<CreateCourseReviewResponse>(
      `/courses/${courseId}/reviews`,
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * 후기 수정.
 *
 * images를 생략하면 기존 사진이 유지되고, 빈 배열이면 전부 삭제된다. 요청
 * 모양은 types/review.type.ts의 UpdateReviewRequest 참고.
 */
export async function updateReview(
  reviewId: number,
  request: UpdateReviewRequest,
): Promise<UpdateReviewResponse> {
  try {
    const { data } = await apiClient.patch<UpdateReviewResponse>(
      `/reviews/${reviewId}`,
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteReview(reviewId: number): Promise<void> {
  try {
    await apiClient.delete(`/reviews/${reviewId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
