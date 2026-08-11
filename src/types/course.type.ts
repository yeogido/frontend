export type CourseType = 'OFFICIAL' | 'LOCAL';

export type CourseTransportType = 'WALK' | 'PUBLIC' | 'CAR';

export type CourseDurationType =
  'DAY_TRIP' | 'ONE_NIGHT' | 'TWO_NIGHT' | 'THREE_PLUS';

export type CourseCompanionType =
  'SOLO' | 'FRIEND' | 'COUPLE' | 'FAMILY' | 'PET';

export type CourseSort =
  'RECOMMEND' | 'POPULAR' | 'DISTANCE' | 'LATEST' | 'SAVED' | 'REVIEW';

export interface Course {
  courseId: number;
  thumbnailUrl: string;
  routeImageUrl?: string | null;
  title: string;
  region: string;
  durationType: CourseDurationType;
  transportType: CourseTransportType;
  companionType: CourseCompanionType;
  tags: string[];
  isLiked: boolean;
}

export interface GetCoursesResponse {
  items: Course[];
  cursorValue: string;
  cursorId: number;
  hasNext: boolean;
}

export interface GetCoursesParams {
  /** 미전달 시 서버가 OFFICIAL/LOCAL 코스를 모두 반환한다. */
  courseType?: CourseType;
  keyword?: string;
  /** 코스에 CONTENT 타입 항목으로 포함된 콘텐츠(행사 등) ID로 필터링한다. */
  contentId?: number;
  regionId?: number;
  transportType?: CourseTransportType;
  durationType?: CourseDurationType;
  companionType?: CourseCompanionType;
  sort?: CourseSort;
  latitude?: number;
  longitude?: number;
  cursorValue?: string;
  cursorId?: number;
  size?: number;
}

export interface GetPopularCoursesParams {
  courseType: CourseType;
  regionId?: number;
}

export interface PopularLocalCourseAuthor {
  userId: number;
  nickname: string;
  // 문서 예시는 string이지만 실제 응답은 프로필 사진이 없으면 null을 준다.
  profileImageUrl: string | null;
}

/** /courses/popular/local 전용 응답 — 인기순(없으면 최신순) 로컬 코스
 * 최대 4개, 일반 코스 목록과 달리 작성자 정보를 포함하고 region은 없다. */
export interface PopularLocalCourse {
  courseId: number;
  thumbnailUrl: string;
  routeImageUrl?: string | null;
  title: string;
  durationType: CourseDurationType;
  companionType: CourseCompanionType;
  author: PopularLocalCourseAuthor;
  createdAt: string;
  tags: string[];
  isLiked: boolean;
}

export interface RecommendedCourse {
  courseId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  // 문서상 스펙과 실제 응답의 enum 표기가 달라(ONE_DAY/MORE vs DAY_TRIP/THREE_PLUS 등)
  // 확정되지 않아 원문 그대로 string으로 받고, 표시 시점에 안전하게 매핑한다.
  durationType: string;
  transportType: string;
}
