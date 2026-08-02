import type {
  BusinessPromotionCategoryParam,
  BusinessPromotionItem,
  BusinessPromotionSortParam,
} from '../../../types/businessPromotion.type';
import type { BusinessCategory, BusinessItem, BusinessSort } from '../types';

const CATEGORY_PARAM_BY_LABEL: Record<
  Exclude<BusinessCategory, '전체'>,
  BusinessPromotionCategoryParam
> = {
  맛집: 'FOOD',
  카페: 'CAFE',
  베이커리: 'BAKERY',
  체험: 'EXPERIENCE',
  전시: 'EXHIBITION',
};

const SORT_PARAM_BY_LABEL: Record<BusinessSort, BusinessPromotionSortParam> = {
  추천순: 'RECOMMEND',
  저장순: 'SAVED',
};

// promotionCategory 응답값이 영문 enum("CAFE")과 한글 라벨("카페") 중
// 어느 쪽으로 오는지 스펙 문서 예시가 서로 달라(쿼리 파라미터는 영문,
// 응답 예시는 한글) 둘 다 인식하도록 방어적으로 매핑한다.
const CATEGORY_LABEL_BY_PARAM: Record<
  BusinessPromotionCategoryParam,
  Exclude<BusinessCategory, '전체'>
> = {
  FOOD: '맛집',
  CAFE: '카페',
  BAKERY: '베이커리',
  EXPERIENCE: '체험',
  EXHIBITION: '전시',
};

export function mapBusinessCategoryToApiParam(
  category: Exclude<BusinessCategory, '전체'>
): BusinessPromotionCategoryParam {
  return CATEGORY_PARAM_BY_LABEL[category];
}

export function mapBusinessSortToApiParam(
  sort: BusinessSort
): BusinessPromotionSortParam {
  return SORT_PARAM_BY_LABEL[sort];
}

export function mapApiCategoryToLabel(
  promotionCategory: string
): Exclude<BusinessCategory, '전체'> {
  return (
    CATEGORY_LABEL_BY_PARAM[promotionCategory as BusinessPromotionCategoryParam] ??
    (promotionCategory as Exclude<BusinessCategory, '전체'>)
  );
}

export function formatBusinessPromotionDate(createdAt: string): string {
  return createdAt.slice(0, 10).replace(/-/g, '.');
}

export function mapBusinessPromotionItemToBusinessItem(
  item: BusinessPromotionItem
): BusinessItem {
  return {
    id: String(item.promotionId),
    title: item.placeName,
    description: item.shortDescription,
    location: item.regionName,
    category: mapApiCategoryToLabel(item.promotionCategory),
    // 목록 API에 작성자 정보가 없어 업체명/대표 이미지로 임시 대체한다.
    // TODO: 백엔드가 목록 API에 author 필드 추가 시 복구 필요
    author: item.placeName,
    date: formatBusinessPromotionDate(item.createdAt),
    image: item.thumbnailImageUrl,
  };
}
