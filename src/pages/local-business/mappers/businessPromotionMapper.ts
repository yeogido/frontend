import { regionCities } from '../../../constants/regions.ts';
import type { RegionCityId } from '../../../constants/regions';
import type {
  BusinessPromotionCategoryParam,
  BusinessPromotionItem,
  BusinessPromotionSortParam,
} from '../../../types/businessPromotion.type';
import type { Region } from '../../../types/region.type';
import { toContentTagIds } from '../../../utils/contentTags.ts';
import { getFullRegionName } from '../../../utils/regionName.ts';
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
    CATEGORY_LABEL_BY_PARAM[
      promotionCategory as BusinessPromotionCategoryParam
    ] ?? (promotionCategory as Exclude<BusinessCategory, '전체'>)
  );
}

export function formatBusinessPromotionDate(createdAt: string): string {
  return createdAt.slice(0, 10).replace(/-/g, '.');
}

// regionName은 GET /regions/{regionId}/sub-regions 테이블의 구/군/시/읍/면/동
// 단위 이름이 내려온다(예: "계양구", 세종은 "고운동" 같은 동 단위, 제주는
// "제주시"/"서귀포시" 등 — 실제 API로 17개 시/도 전부 확인함, 어느 지역도
// 자기 자신의 시/도명과 같은 sub-region 이름을 갖지 않는다). roadAddress
// 첫 토큰(예: "인천")을 정식 시/도 명칭으로 바꿔 앞에 붙여 "인천광역시
// 계양구" 형태로 만든다.
// regionName이 (드물게, 또는 향후 데이터 변경으로) 시/도명 자체와 같은
// 값으로 내려오는 경우까지 방어한다 — roadAddress 축약형("세종")이든
// regionName 정식형("세종특별자치시")이든 같은 시/도를 가리키면 시/도명만
// 반환해 "세종특별자치시 세종특별자치시" 같은 중복 표기를 막는다.
// roadAddress가 비어 있으면 regionName만 그대로 쓴다.
export function toRegionDisplayName(
  regionName: string,
  roadAddress: string
): string {
  const provinceToken = roadAddress.trim().split(/\s+/)[0];

  if (!provinceToken) {
    return regionName;
  }

  const fullProvinceName = getFullRegionName(provinceToken);
  const isRegionNameTheProvinceItself =
    regionName === provinceToken ||
    regionName === fullProvinceName ||
    getFullRegionName(regionName) === fullProvinceName;

  return isRegionNameTheProvinceItself
    ? fullProvinceName
    : `${fullProvinceName} ${regionName}`;
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
    placeId: item.placeId,
    title: item.placeName,
    description: item.shortDescription,
    location: toRegionDisplayName(item.regionName, item.roadAddress),
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
