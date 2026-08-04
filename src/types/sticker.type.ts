export const STICKER_CATEGORIES = [
  'NATURE',
  'FOOD',
  'ANIMAL',
  'PERSON',
  'OBJECT',
  'CUSTOM',
] as const;

export type StickerCategory = (typeof STICKER_CATEGORIES)[number];

export type StickerType = 'DEFAULT' | 'CUSTOM';

export interface StickerResponse {
  stickerId: number;
  name: string;
  imageUrl: string;
  stickerType: StickerType;
}

export interface StickerCategoryGroup {
  category: StickerCategory;
  stickers: StickerResponse[];
}

export interface StickerListResponse {
  categories: StickerCategoryGroup[];
}

export interface CustomStickerCreateRequest {
  /** Presigned URL로 S3의 temp/ 경로에 업로드한 이미지 객체 키. */
  imageKey: string;
}

export interface CustomStickerCreateResponse {
  stickerId: number;
  name: string;
  imageUrl: string;
  category: StickerCategory;
  stickerType: StickerType;
  createdAt: string;
}
