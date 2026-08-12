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
  regionId?: number;
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
  hashtags: string[];
  author: BusinessPromotionAuthor;
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

// 스웨거 기준: BusinessHour (POST /business-promotions 요청 바디 전용).
// 조회 응답의 BusinessPromotionBusinessHour와 필드는 같지만, 요청/응답 스키마가
// 스웨거에서도 별도 컴포넌트(BusinessHour vs BusinessHourInfo)로 분리돼 있어
// 여기서도 따로 정의한다. dayOfWeek는 스웨거 스키마 자체엔 enum이 없고
// (예시값만 MONDAY 등 영문 대문자) 실응답 예시도 같은 표기를 쓰지만,
// 문서와 실제가 어긋난 전례가 있어 string으로 넓게 받는다.
export interface BusinessPromotionHourRequest {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

// 스웨거 기준: Image (요청 바디 전용). imageKey는 파일명이 아니라
// 별도 업로드 API(files.api.ts류)로 미리 받아온 objectKey다.
// sortOrder는 1~5, 첫 번째(1)가 대표 사진으로 쓰인다.
export interface BusinessPromotionImageRequest {
  imageKey: string;
  sortOrder: number;
}

// 스웨거 기준: BusinessRegisterReqDTO (POST /business-promotions).
// businessInfoId는 GET /users/me/businesses(BusinessInfoResponse.businessInfoId)로
// 받아온, 인증 완료된 내 사업장 ID다 — place 검색 결과의 placeId가 아니다.
// hashtagIds도 라벨 문자열이 아니라 ID 배열이다.
// 필수: businessInfoId, shortDescription, ownerComment, businessHours(1개 이상),
// phoneNumber, promotionCategory, images(1~5개). snsAccount·hashtagIds는 선택.
export interface BusinessPromotionCreateRequest {
  businessInfoId: number;
  shortDescription: string;
  ownerComment: string;
  businessHours: BusinessPromotionHourRequest[];
  snsAccount?: string;
  phoneNumber: string;
  hashtagIds?: number[];
  promotionCategory: BusinessPromotionCategoryParam;
  images: BusinessPromotionImageRequest[];
}

// 스웨거 기준: BusinessRegisterResDTO
export interface BusinessPromotionCreateResponse {
  promotionId: number;
}
