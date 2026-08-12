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

/**
 * 화면에 놓인 사진 한 장. 새로 고른 사진은 File을 들고 있다가 제출 시
 * 업로드하고, 수정 화면에서 프리필된 기존 사진은 File 없이 서버가 이미
 * 갖고 있는 imageKey를 그대로 되돌려 보낸다(ReviewEditModal의
 * EditablePhoto와 같은 모양).
 */
export type PhotoTagSelectionPhoto =
  | { id: string; kind: 'new'; file: File; previewUrl: string }
  | { id: string; kind: 'existing'; imageKey: string; previewUrl: string };

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
