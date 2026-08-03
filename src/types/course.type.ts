export type CourseType = 'OFFICIAL' | 'LOCAL';

export type CourseTransportType = 'WALK' | 'PUBLIC' | 'CAR';

export type CourseDurationType =
  | 'DAY_TRIP'
  | 'ONE_NIGHT'
  | 'TWO_NIGHT'
  | 'THREE_PLUS';

export type CourseCompanionType =
  | 'SOLO'
  | 'FRIEND'
  | 'COUPLE'
  | 'FAMILY'
  | 'PET';

export type CourseSort =
  | 'RECOMMEND'
  | 'DISTANCE'
  | 'LATEST'
  | 'SAVED'
  | 'REVIEW';

export interface Course {
  courseId: number;
  thumbnailUrl: string;
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
  courseType: CourseType;
  keyword?: string;
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
