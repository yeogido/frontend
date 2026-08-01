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
