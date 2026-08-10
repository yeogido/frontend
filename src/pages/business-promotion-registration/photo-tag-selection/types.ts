import { businessCategories } from '../../local-business/constants';
import type { BusinessCategory } from '../../local-business/types';
import type { BusinessPromotionCategoryParam } from '../../../types/businessPromotion.type';
import type { TagId } from '../../../types/tag.type';

export type { TagId };

export type PromotionCategoryLabel = Exclude<BusinessCategory, '전체'>;

export const promotionCategoryOptions: readonly PromotionCategoryLabel[] =
  businessCategories.filter(
    (category): category is PromotionCategoryLabel => category !== '전체'
  );

export interface PhotoTagSelectionPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

export interface PhotoTagSelectionImage {
  imageKey: string;
  sortOrder: number;
}

// business-promotions.api.ts의 BusinessPromotionCreateRequest 중 이 화면이
// 책임지는 필드만 골라낸 모양이다. businessInfoId(장소 선택)·나머지 텍스트
// 필드(홍보글 정보 입력)는 다른 단계에서 채워 최종 합쳐진다.
export interface PhotoTagSelectionResult {
  images: PhotoTagSelectionImage[];
  hashtagIds: number[];
  promotionCategory: BusinessPromotionCategoryParam;
}
