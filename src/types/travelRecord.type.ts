import type { CursorResponse } from '../apis/common';

export interface TravelRecordListParams {
  cursor?: number;
  size?: number;
  year?: number;
}

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
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  folderTheme?: string;
  images: TravelRecordImageRequest[];
  stickers?: TravelRecordStickerRequest[];
}

export interface TravelRecordCreateResponse {
  travelRecordId: number;
  title: string;
  coverImageKey: string;
  createdAt: string;
}

export type TravelRecordUpdateRequest = TravelRecordCreateRequest;

export interface TravelRecordUpdateResponse {
  travelRecordId: number;
}

export interface TravelRecordSummary {
  travelRecordId: number;
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  folderTheme?: string;
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
  travelRecordId: number;
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  folderTheme?: string;
  images?: TravelRecordImageResponse[];
  stickers?: TravelRecordStickerResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface TravelRecordYearListResponse {
  years: number[];
}

export type TravelRecordListResponse =
  CursorResponse<TravelRecordSummary, unknown>;

export interface UploadedTravelRecordImage {
  objectKey: string;
}
