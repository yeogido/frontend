import type { Region, SubRegion } from '../../types/region.type';

// 카카오 장소 검색 결과에는 백엔드 regionId가 없어서 주소로 역산한다.
//
// 어느 단위를 보내야 하는지는 운영 데이터로 확인했다. GET /business-promotions
// 응답을 보면 '부산 수영구 …' 사업장이 regionId 31(수영구, 부산 광역은 27),
// '대전 동구 …'가 74(동구, 대전 광역은 72)를 쓴다. 홍보글의 지역은 인증된
// 사업장의 Place에서 오므로 PlaceRequest.regionId는 시·군·구 단위다.
// (명세서 예시의 regionId 1은 광역이지만 실제 데이터와 맞지 않는다.)
//
// 광역과 시·군·구가 하나의 ID 공간을 공유한다 — 1 서울, 2~26 서울의 구,
// 27 부산, 28~43 부산의 구 순이다. 그래서 광역 ID도 그 자체로 유효하며,
// 하위 지역이 없는 곳(세종·제주·강원은 sub-regions가 빈 배열이다)에서는
// 광역 ID를 그대로 쓴다.
//
// 카카오는 '부산 수영구 …'처럼 축약형을, 명세서 예시는 '서울특별시 …'처럼
// 전체 표기를 쓰므로 양쪽을 모두 받는다.
const REGION_NAME_BY_ADDRESS_PREFIX: Record<string, string> = {
  서울: '서울',
  서울시: '서울',
  서울특별시: '서울',
  부산: '부산',
  부산시: '부산',
  부산광역시: '부산',
  대구: '대구',
  대구시: '대구',
  대구광역시: '대구',
  광주: '광주',
  광주시: '광주',
  광주광역시: '광주',
  인천: '인천',
  인천시: '인천',
  인천광역시: '인천',
  대전: '대전',
  대전시: '대전',
  대전광역시: '대전',
  울산: '울산',
  울산시: '울산',
  울산광역시: '울산',
  세종: '세종',
  세종시: '세종',
  세종특별자치시: '세종',
  경기: '경기',
  경기도: '경기',
  강원: '강원',
  강원도: '강원',
  강원특별자치도: '강원',
  충북: '충북',
  충청북도: '충북',
  충남: '충남',
  충청남도: '충남',
  전북: '전북',
  전라북도: '전북',
  전북특별자치도: '전북',
  전남: '전남',
  전라남도: '전남',
  경북: '경북',
  경상북도: '경북',
  경남: '경남',
  경상남도: '경남',
  제주: '제주',
  제주도: '제주',
  제주특별자치도: '제주',
};

function splitAddress(address: string) {
  return address.trim().split(/\s+/);
}

// 매칭에 실패하면 undefined를 돌려준다. 임의의 ID를 넣어 보내면 백엔드가
// REGION4041로 거절하므로, 호출부가 제출을 막고 장소를 다시 고르게 한다.
export function resolveProvinceRegionId(
  address: string,
  regions: readonly Region[] | undefined
): number | undefined {
  if (!regions) {
    return undefined;
  }

  const [addressPrefix] = splitAddress(address);

  if (!addressPrefix) {
    return undefined;
  }

  const regionName = REGION_NAME_BY_ADDRESS_PREFIX[addressPrefix];

  if (!regionName) {
    return undefined;
  }

  return regions.find((region) => region.name === regionName)?.regionId;
}

// 주소의 두 번째 토큰이 시·군·구다. 경기는 '성남시'까지만 하위 지역으로
// 두므로 '경기도 성남시 분당구'에서도 두 번째 토큰이 맞는다.
// 못 찾으면 undefined를 돌려주고 호출부가 광역 ID로 폴백한다.
export function resolveSubRegionId(
  address: string,
  subRegions: readonly SubRegion[] | undefined
): number | undefined {
  if (!subRegions || subRegions.length === 0) {
    return undefined;
  }

  const [, subRegionName] = splitAddress(address);

  if (!subRegionName) {
    return undefined;
  }

  return subRegions.find((subRegion) => subRegion.name === subRegionName)
    ?.subRegionId;
}
