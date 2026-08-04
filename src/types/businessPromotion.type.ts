import type { CursorResponse } from '../apis/common';

export type BusinessPromotionCategoryParam =
  | 'FOOD'
  | 'CAFE'
  | 'BAKERY'
  | 'EXPERIENCE'
  | 'EXHIBITION';

export type BusinessPromotionSortParam = 'RECOMMEND' | 'SAVED';

export interface BusinessPromotionListParams {
  cursorValue?: string;
  cursorId?: number;
  size?: number;
  category?: BusinessPromotionCategoryParam;
  sort?: BusinessPromotionSortParam;
}

export interface BusinessPromotionItem {
  promotionId: number;
  placeId: number;
  placeName: string;
  // 목록 응답 예시가 한글 라벨("카페")로 와서 enum으로 좁히지 않는다.
  promotionCategory: string;
  roadAddress: string;
  regionId: number;
  regionName: string;
  thumbnailImageUrl: string;
  shortDescription: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export type BusinessPromotionListResponse = CursorResponse<
  BusinessPromotionItem,
  string
>;

export interface BusinessPromotionPlace {
  placeId: number;
  name: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
}

export interface BusinessPromotionBusinessHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

export interface BusinessPromotionImage {
  imageUrl: string;
  sortOrder: number;
}

export interface BusinessPromotionAuthor {
  nickname: string;
  profileImageUrl: string;
}

export interface BusinessPromotionDetailResponse {
  promotionId: number;
  place: BusinessPromotionPlace;
  promotionCategory: string;
  shortDescription: string;
  ownerComment: string;
  businessHours: BusinessPromotionBusinessHour[];
  snsAccount: string;
  phoneNumber: string;
  hashtags: string[];
  images: BusinessPromotionImage[];
  author: BusinessPromotionAuthor;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}
