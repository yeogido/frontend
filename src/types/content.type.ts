export type ContentCategory =
  'EXPERIENCE' | 'EXHIBITION' | 'PERFORMANCE' | 'FESTIVAL';

export type ContentSort = 'RECOMMEND' | 'LIKE' | 'DISTANCE' | 'DEADLINE';

export type ContentStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';

/** 관광공사 동기화 콘텐츠 검토 상태 — 생략하면 서버 기본값은 PUBLISHED다. */
export type ContentPublicationStatus = 'PENDING' | 'PUBLISHED';

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

/** 동기화된 관광공사 콘텐츠 게시 요청 — 전부 선택값이고, 생략한 값은 동기화된 값을 유지한다. */
export interface ContentPublishRequest {
  title?: string;
  description?: string;
  category?: ContentCategory;
  hashtagIds?: number[];
  recommendPriority?: number;
}

export interface ContentPublishResult {
  contentId: number;
}

export interface TourContentSyncResult {
  receivedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  synchronizedAt: string;
}

export interface CultureContent {
  contentId: number;
  placeId: number;
  title: string;
  thumbnailImageUrl: string | null;
  regionName: string;
  hashtags: string[];
  likeCount: number;
  /** 목록 응답에 실제 좋아요 여부가 내려온다 — 상세(liked)와 필드명만 다르다. */
  isLiked: boolean;
  startDate: string;
  endDate: string;
  /** 관리자만 PENDING으로 조회 가능. 생략 시(대부분의 응답) 항상 PUBLISHED다. */
  publicationStatus?: ContentPublicationStatus;
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
  courseItemId: number;
  placeId: number;
  externalPlaceId?: string;
  source?: ContentPlaceSource;
  name: string;
  roadAddress: string;
  lotAddress?: string;
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
  /** 최근 상세 조회 응답에 추가됨 — 예전엔 없었다(수정 시 재선택 필요했던 이유). */
  category?: ContentCategory;
  thumbnailImage?: string;
  thumbnailImageUrl?: string;
  hashtags: string[];
  hashtagIds?: number[];
  startDate: string;
  endDate: string;
  liked: boolean;
  phone: string;
  officialUrl: string;
  place: CultureContentPlace;
  courses: CultureContentCourse[];
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
  statuses?: ContentStatus[];
  /** 생략하면 서버 기본값 PUBLISHED만 조회된다 — PENDING은 관리자 전용. */
  publicationStatus?: ContentPublicationStatus;
  keyword?: string;
  sort?: ContentSort;
  latitude?: number;
  longitude?: number;
  cursorValue?: string;
  cursorId?: number;
  size?: number;
}
