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
  // 로그인 사용자가 작성한 홍보글 여부. 비로그인 요청 시 false(스웨거 확인 완료).
  isMine: boolean;
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

// 스웨거 기준: ImageInfo. imageKey는 화면에 노출하진 않지만, 수정(PATCH)
// 화면에서 기존 이미지를 그대로 images 배열에 다시 실어 보낼 때 필요하다.
export interface BusinessPromotionImage {
  imageKey: string;
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
  businessHours: BusinessPromotionBusinessHour[];
  snsAccount: string;
  phoneNumber: string;
  hashtags: string[];
  images: BusinessPromotionImage[];
  author: BusinessPromotionAuthor;
  likeCount: number;
  // 로그인 사용자가 작성한 홍보글 여부. 비로그인 요청 시 false(스웨거 확인 완료).
  isMine: boolean;
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
// ownerComment는 회의 결정으로 shortDescription과 통합되며 스펙에서 삭제됐다
// (기획 결론 — shortDescription 하나로 정리).
// 필수: businessInfoId, shortDescription, businessHours(1개 이상),
// phoneNumber, promotionCategory, images(1~5개). snsAccount·hashtagIds는 선택.
export interface BusinessPromotionCreateRequest {
  businessInfoId: number;
  shortDescription: string;
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

// 스웨거 기준: BusinessUpdateReqDTO (PATCH /business-promotions/{id}).
// 등록 요청(BusinessRegisterReqDTO)과 달리 businessInfoId(장소)와
// ownerComment는 이 스키마에 아예 없다 — 둘 다 수정 API로는 못 바꾼다.
// 그 외 필드는 전부 선택이라 보낸 필드만 부분 수정되고, businessHours·
// hashtagIds·images는 보내는 순간 배열 전체가 교체된다(부분 추가/삭제 아님).
// snsAccount를 완전히 지우고 싶을 땐 snsAccount를 아예 안 보내고
// clearSnsAccount: true만 보낸다 — 스웨거엔 없지만 실제로는 둘을 같이
// 보내면 COMMON4001로 거부된다(백엔드 확인).
export interface BusinessPromotionUpdateRequest {
  shortDescription?: string;
  businessHours?: BusinessPromotionHourRequest[];
  snsAccount?: string;
  clearSnsAccount?: boolean;
  phoneNumber?: string;
  hashtagIds?: number[];
  promotionCategory?: BusinessPromotionCategoryParam;
  images?: BusinessPromotionImageRequest[];
}

// 스웨거 기준: BusinessUpdateResDTO
export interface BusinessPromotionUpdateResponse {
  promotionId: number;
}
