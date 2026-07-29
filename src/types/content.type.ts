export type ContentCategory =
  | 'EXPERIENCE'
  | 'EXHIBITION'
  | 'PERFORMANCE'
  | 'FESTIVAL';

export type ContentSort = 'RECOMMEND' | 'LIKE' | 'DISTANCE' | 'DEADLINE';

export interface CultureContent {
  contentId: number;
  placeId: number;
  title: string;
  thumbnailImageUrl: string;
  regionName: string;
  hashtags: string[];
  likeCount: number;
  startDate: string;
  endDate: string;
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
