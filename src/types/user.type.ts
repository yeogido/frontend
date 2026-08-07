// GET /users/me/posts 응답 중 프론트가 실제로 쓰는 부분만 정의한다.
// enum은 다른 응답과 마찬가지로 string으로 받고 표시 시점에 매핑한다.

export type MyPostCategory = 'ALL' | 'COURSE' | 'REVIEW' | 'PROMOTION';

/**
 * 리뷰 카드에 코스 정보를 함께 그릴 때 쓰는 요약.
 * GET /reviews의 ReviewCourseSummary(review.type.ts)와 같은 모양이다.
 */
export interface MyCourseSummary {
  id: number;
  title: string;
  thumbnailUrl: string;
  durationType: string;
  transportType: string;
  companionType: string;
  hashtags: string[];
}

export interface MyCourse extends MyCourseSummary {
  content: string;
  createdAt: string;
}

export interface MyReview {
  reviewId: number;
  reviewerName: string;
  reviewerProfileImage: string;
  ageGroup: string;
  gender: string;
  rating: number;
  content: string;
  createdAt: string;
  /** 백엔드가 코스 정보를 함께 내려줄 때만 채워진다(현재 응답 예시엔 없음). */
  course?: MyCourseSummary;
}

export interface MyPromotion {
  promotionId: number;
  placeId: number;
  placeName: string;
  promotionCategory: string;
  roadAddress: string;
  thumbnailImageUrl: string;
  shortDescription: string;
  hashtags: string[];
  status: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyPost {
  course?: MyCourse;
  review?: MyReview;
  promotion?: MyPromotion;
}

export interface GetMyPostsParams {
  category?: MyPostCategory;
  keyword?: string;
  sort?: 'LATEST' | 'OLDEST';
  cursorCreatedAt?: string;
  cursorId?: number;
  size?: number;
}

export interface GetMyPostsResponse {
  items: MyPost[];
  cursorValue: string | number | null;
  cursorId: number | null;
  hasNext: boolean;
}
