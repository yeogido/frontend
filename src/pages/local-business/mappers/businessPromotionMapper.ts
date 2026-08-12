import { regionCities } from '../../../constants/regions';
import type { RegionCityId } from '../../../constants/regions';
import type {
  BusinessPromotionCategoryParam,
  BusinessPromotionItem,
  BusinessPromotionSortParam,
} from '../../../types/businessPromotion.type';
import type { Region } from '../../../types/region.type';
import { toContentTagIds } from '../../../utils/contentTags';
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

// regionCities(캐러셀이 쓰는 정적 문자열 슬러그)와 getRegions()(백엔드 실제
// 지역 목록, 숫자 regionId)를 지역명으로 매칭한다. 두 데이터 소스의 표기가
// 어긋나 매칭에 실패하면(존재하지 않는 이름 등) undefined를 반환해 전체
// 조회로 안전하게 폴백한다 — 잘못된 regionId로 필터링해 빈 목록을
// 보여주는 것보다 낫다.
export function resolveRegionId(
  selectedRegionId: RegionCityId,
  regions: readonly Region[] | undefined
): number | undefined {
  const cityName = regionCities.find(
    (city) => city.id === selectedRegionId
  )?.name;

  if (!cityName || !regions) {
    return undefined;
  }

  return regions.find((region) => region.name === cityName)?.regionId;
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
    author: item.author.nickname,
    authorAvatarUrl: item.author.profileImageUrl,
    date: formatBusinessPromotionDate(item.createdAt),
    image: item.thumbnailImageUrl,
    tags: toContentTagIds(item.hashtags),
    liked: item.isLiked,
    isMine: item.isMine,
  };
}
