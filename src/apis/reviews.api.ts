import { apiClient, normalizeApiError } from './common';

import type {
  CourseReviewPreview,
  CreateCourseReviewRequest,
  CreateCourseReviewResponse,
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
 * 정렬/커서 파라미터가 없어 전체 배열이 한 번에 내려온다. 후기 전체보기
 * 화면의 최신순/별점순은 당분간 받아온 뒤 클라이언트에서 정렬한다.
 * (백엔드에 정렬·페이징 추가 요청 중)
 */
export async function getCourseReviews(
  courseId: number,
): Promise<CourseReviewPreview[]> {
  try {
    const { data } = await apiClient.get<CourseReviewPreview[]>(
      `/courses/${courseId}/reviews`,
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

/** 수정 화면이 아직 없다. 사유는 types/review.type.ts 참고. */
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
