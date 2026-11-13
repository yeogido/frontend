import type { CursorResponse } from '../apis/common';

export interface TravelRecordListParams {
  cursor?: number;
  size?: number;
  year?: number;
}

export type TravelRecordApiVisibility = 'PRIVATE' | 'FRIENDS' | 'PUBLIC';

export interface TravelRecordUserProfile {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface TravelRecordPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canLeave: boolean;
  canInvite: boolean;
  canLinkShare: boolean;
}

export interface TravelRecordVisibilityUpdateRequest {
  visibility: 'PRIVATE' | 'PUBLIC';
  version: number;
}

export interface TravelRecordVisibilityUpdateResponse {
  travelRecordId: number;
  visibility: TravelRecordApiVisibility;
  version: number;
}

export interface TravelRecordInvitationCreateResponse {
  travelRecordId: number;
  invitations: Array<{
    invitationId: number;
    inviteeUserId: number;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    createdAt: string;
  }>;
}

export interface TravelRecordMapParams extends TravelRecordListParams {
  visibility?: TravelRecordApiVisibility;
}

export interface TravelRecordMapItem {
  travelRecordId: number;
  title: string;
  regionId: number;
  regionName: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
  visibility: TravelRecordApiVisibility;
  images: TravelRecordImageResponse[];
}

export type TravelRecordMapResponse = CursorResponse<TravelRecordMapItem, null>;

export interface TravelRecordImageRequest {
  imageKey: string;
  imageOrder: number;
}

export interface TravelRecordStickerRequest {
  stickerId: number;
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface TravelRecordCreateRequest {
  visibility?: TravelRecordApiVisibility;
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  /** 폴더 색상 변경 기능이 없어 서버가 BASIC으로 고정해 저장한다. */
  folderTheme: string;
  images: TravelRecordImageRequest[];
  /** 생략하면 기존 스티커를 유지하고, 빈 배열이면 전부 삭제한다. */
  stickers?: TravelRecordStickerRequest[];
}

export interface TravelRecordCreateResponse {
  travelRecordId: number;
  title: string;
  coverImageKey: string;
  createdAt: string;
}

export interface TravelRecordUpdateRequest
  extends Omit<TravelRecordCreateRequest, 'visibility'> {
  version: number;
}

export interface TravelRecordUpdateResponse {
  travelRecordId: number;
}

export interface TravelRecordSummary {
  visibility?: TravelRecordApiVisibility;
  travelRecordId: number;
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  folderTheme: string;
  createdAt: string;
}

export interface TravelRecordImageResponse {
  imageId: number;
  imageKey: string;
  imageUrl: string;
  imageOrder: number;
}

export interface TravelRecordStickerResponse {
  recordStickerId: number;
  stickerId: number;
  imageUrl: string;
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface TravelRecordDetailResponse {
  /** 편집 시 읽은 버전. 누락된 이전 응답으로는 수정 요청을 만들지 않는다. */
  version?: number;
  visibility?: TravelRecordApiVisibility;
  owner?: TravelRecordUserProfile;
  participants?: TravelRecordUserProfile[];
  permissions?: TravelRecordPermissions;
  travelRecordId: number;
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  folderTheme: string;
  images?: TravelRecordImageResponse[];
  stickers?: TravelRecordStickerResponse[];
  createdAt: string;
  /** 수정한 적이 없으면 서버가 null을 줄 수 있다. */
  updatedAt?: string | null;
}

export interface TravelRecordYearListResponse {
  years: number[];
}

export type TravelRecordListResponse = CursorResponse<
  TravelRecordSummary,
  unknown
>;

export interface UploadedTravelRecordImage {
  objectKey: string;
}
