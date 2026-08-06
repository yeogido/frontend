// GET /users/me/posts 응답 중 프론트가 실제로 쓰는 부분만 정의한다.
// enum은 다른 응답과 마찬가지로 string으로 받고 표시 시점에 매핑한다.

export type MyPostCategory = 'ALL' | 'COURSE' | 'REVIEW';

export interface MyReview {
  reviewId: number;
  reviewerName: string;
  reviewerProfileImage: string;
  ageGroup: string;
  gender: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface MyPost {
  review?: MyReview;
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
