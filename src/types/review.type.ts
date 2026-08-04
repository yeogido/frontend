// 리뷰 API 타입. Swagger(https://api.yeogido.kr/v3/api-docs)를 기준으로 하되,
// enum은 문서와 실제 응답의 표기가 어긋난 사례가 반복돼 string으로 받고
// 표시 시점에 src/utils/courseEnumLabels.ts에서 매핑한다.

export interface ReviewImage {
  imageUrl: string;
  imageOrder: number;
  /**
   * 리뷰 수정 시 "유지할 이미지"를 지목하려면 imageKey가 필요한데, 현재
   * 조회 응답은 URL만 내려준다(백엔드 추가 요청 중). 내려오기 시작하면
   * 그대로 채워지도록 선택 필드로 둔다.
   */
  imageKey?: string;
}

export interface ReviewAuthor {
  nickname: string;
  ageGroup: string;
  /** 프로필을 설정하지 않은 계정은 null로 온다(확인됨). */
  profileImageUrl: string | null;
  /** 아직 리뷰 응답에는 없다. 추가되면 카드 메타가 "20대 여"로 완성된다. */
  gender?: string;
}

export interface ReviewCourseSummary {
  courseId: number;
  title: string;
  thumbnailUrl: string;
  durationType: string;
  transportType: string;
  isLiked: boolean;
}

/** GET /reviews 목록 아이템. 코스 정보를 함께 포함한다. */
export interface ReviewDetail {
  reviewId: number;
  content: string;
  rating: number;
  createdAt: string;
  images: ReviewImage[];
  author: ReviewAuthor;
  course: ReviewCourseSummary;
}

/** GET /reviews/recent 아이템. 코스 정보가 없다. */
export interface RecentReview {
  reviewId: number;
  content: string;
  rating: number;
  createdAt: string;
  images: ReviewImage[];
  author: ReviewAuthor;
}

export type ReviewSort = 'LATEST' | 'RATING';

export interface GetReviewsParams {
  cursor?: number;
  size?: number;
  sort?: ReviewSort;
}

export interface GetReviewsResponse {
  items: ReviewDetail[];
  /**
   * 다음 페이지 기준값. 정렬에 따라 일시(LATEST)와 별점(RATING)이 모두 올 수
   * 있어 좁히지 않는다. 요청에는 cursorValue를 받는 파라미터가 없어서 현재는
   * 읽기만 하고 보내지 않는다(백엔드 확인 중).
   */
  cursorValue: string | number | null;
  cursorId: number | null;
  hasNext: boolean;
}

export interface GetRecentReviewsResponse {
  reviews: RecentReview[];
}

/** GET /courses/{courseId}/reviews 아이템. 이미지가 URL 배열이다. */
export interface CourseReviewPreview {
  reviewId: number;
  author: ReviewAuthor;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

/**
 * 리뷰 작성 요청의 이미지. 순서 필드명이 수정 API(imageOrder)와 다르게
 * order다. 백엔드에 통일을 요청해 두었고, 통일되면 ReviewImageRequest 하나로
 * 합칠 수 있다.
 */
export interface CourseReviewImageRequest {
  imageKey: string;
  order: number;
}

export interface CreateCourseReviewRequest {
  rating: number;
  content?: string;
  images?: CourseReviewImageRequest[];
}

export interface CreateCourseReviewResponse {
  reviewId: number;
}

export interface ReviewImageRequest {
  imageKey: string;
  imageOrder: number;
}

export interface UpdateReviewRequest {
  rating: number;
  content?: string;
  /** 생략하면 기존 이미지 유지, 빈 배열이면 전체 삭제, 있으면 전체 교체. */
  images?: ReviewImageRequest[];
}

export interface UpdateReviewResponse {
  reviewId: number;
}
