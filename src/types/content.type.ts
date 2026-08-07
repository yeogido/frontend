export type ContentCategory =
  | 'EXPERIENCE'
  | 'EXHIBITION'
  | 'PERFORMANCE'
  | 'FESTIVAL';

export type ContentSort = 'RECOMMEND' | 'LIKE' | 'DISTANCE' | 'DEADLINE';

export type ContentPlaceSource = 'KAKAO' | 'TOUR_API';

export interface ContentCreatePlace {
  externalPlaceId: string;
  source: ContentPlaceSource;
  name: string;
  roadAddress: string;
  lotAddress: string;
  latitude: number;
  longitude: number;
}

export interface ContentCreateRequest {
  place: ContentCreatePlace;
  title: string;
  description: string;
  category: ContentCategory;
  startDate: string;
  endDate: string;
  contactPhone: string;
  officialUrl: string;
  thumbnailImageKey: string;
  hashtagIds: number[];
}

export interface ContentCreateResult {
  contentId: number;
}

export interface CultureContent {
  contentId: number;
  placeId: number;
  title: string;
  thumbnailImageUrl: string | null;
  regionName: string;
  hashtags: string[];
  likeCount: number;
  startDate: string;
  endDate: string;
}

export interface CultureContentBanner {
  contentId: number;
  title: string;
  thumbnailImage: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CultureContentPlace {
  placeId: number;
  name: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
}

export interface CultureContentCourse {
  courseId: number;
  title: string;
  thumbnailImage?: string;
  thumbnailImageUrl?: string;
  description: string;
  durationType?: string;
  duration?: string;
  transportType: string;
  companionType: string;
  liked: boolean;
}

export interface CultureContentDetail {
  contentId: number;
  title: string;
  description: string;
  thumbnailImage?: string;
  thumbnailImageUrl?: string;
  hashtags: string[];
  startDate: string;
  endDate: string;
  liked: boolean;
  phone: string;
  officialUrl: string;
  place: CultureContentPlace;
  courses: CultureContentCourse[];
}

export interface OngoingContent {
  contentId: number;
  title: string;
  thumbnailImageUrl: string | null;
  startDate: string;
  endDate: string;
  regionName: string;
  hashtags: string[];
}

export interface RecentCultureContent {
  contentId: number;
  title: string;
  thumbnailImageUrl: string;
  regionName: string;
  hashtags: string[];
  startDate: string;
  endDate: string;
  liked: boolean;
}

export interface GetCultureContentsResponse {
  items: CultureContent[];
  cursorValue: string;
  cursorId: number;
  hasNext: boolean;
}

export interface GetCultureContentsParams {
  regionId?: number;
  category?: ContentCategory;
  keyword?: string;
  sort?: ContentSort;
  latitude?: number;
  longitude?: number;
  cursorValue?: string;
  cursorId?: number;
  size?: number;
}
