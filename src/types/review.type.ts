// 리뷰 API 타입. Swagger(https://api.yeogido.kr/v3/api-docs)를 기준으로 하되,
// enum은 문서와 실제 응답의 표기가 어긋난 사례가 반복돼 string으로 받고
// 표시 시점에 src/utils/courseEnumLabels.ts에서 매핑한다.

export interface ReviewImage {
  /** 수정 시 유지할 이미지를 지목하는 데 쓴다. */
  imageKey: string;
  imageUrl: string;
  imageOrder: number;
}

export interface ReviewAuthor {
  nickname: string;
  ageGroup: string;
  /** 프로필을 설정하지 않은 계정은 null로 온다(확인됨). */
  profileImageUrl: string | null;
  /** MALE·FEMALE·NONE. 카드 메타를 "20대 여"까지 채운다. */
  gender: string;
}

export interface ReviewCourseSummary {
  courseId: number;
  /** OFFICIAL(여기도) | LOCAL(동네). 어느 상세 라우트로 보낼지 정하는 데 쓴다. */
  courseType: string;
  title: string;
  thumbnailUrl: string;
  durationType: string;
  transportType: string;
  companionType: string;
  /** 해시태그 이름 목록. contentTags의 toContentTagIds로 칩 ID로 바꾼다. */
  tags: string[];
  isLiked: boolean;
}

/** GET /reviews 목록 아이템. 코스 정보를 함께 포함한다. */
export interface ReviewDetail {
  reviewId: number;
  content: string;
  rating: number;
  createdAt: string;
  /** 비로그인 요청에는 false로 온다. */
  isMine: boolean;
  images: ReviewImage[];
  author: ReviewAuthor;
  course: ReviewCourseSummary;
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
   * 있어 좁히지 않는다.
   *
   * 다음 요청에 되돌려 보낼 필요는 없다. 서버가 cursorId로 그 리뷰를 찾아
   * 정렬 기준값을 직접 가져간다(RATING은 rating DESC, reviewId DESC).
   */
  cursorValue: string | number | null;
  cursorId: number | null;
  hasNext: boolean;
}

/**
 * GET /courses/{courseId}/reviews 아이템.
 *
 * 전체 후기 목록(ReviewDetail)과 이미지 모양이 같아졌다(예전에는 URL 배열만
 * 와서 imageKey가 없었고, 그래서 이 화면들에서는 수정을 막아 뒀었다).
 */
export interface CourseReviewPreview {
  reviewId: number;
  author: ReviewAuthor;
  rating: number;
  content: string;
  /** 비로그인 요청에는 false로 온다. */
  isMine: boolean;
  images: ReviewImage[];
  createdAt: string;
}

export interface GetCourseReviewsParams {
  /** 직전 응답의 cursorValue를 그대로 돌려보낸다. LATEST는 createdAt, RATING은 rating. */
  cursorValue?: string;
  cursorId?: number;
  size?: number;
  sort?: ReviewSort;
}

export interface GetCourseReviewsResponse {
  items: CourseReviewPreview[];
  cursorValue: string | number | null;
  cursorId: number | null;
  hasNext: boolean;
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

/*
 * 여기부터는 리뷰 수정용.
 *
 * 두 목록 응답 모두 imageKey를 내려주므로 후기가 보이는 네 화면 전부에서
 * 수정에 들어갈 수 있다.
 */
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
