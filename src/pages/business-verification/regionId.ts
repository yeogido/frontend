import type { Region } from '../../types/region.type';

// 카카오 장소 검색 결과에는 백엔드 regionId가 없다. 그래서 주소의 첫 토큰
// (시·도)을 GET /regions가 주는 17개 광역 지역명과 맞춰 해석한다.
//
// 시·군·구까지 좁히려면 /regions/search로 한 번 더 물어야 하지만, 명세서
// 예시가 '서울특별시 강남구 테헤란로 123' 주소에 regionId 1(서울, 광역)을
// 쓰고 있어 광역 단위로 맞춘다. 호출 한 번을 아끼면서 REGION4041(존재하지
// 않는 지역 ID)도 확실히 피할 수 있다.
//
// 카카오는 '부산 수영구 …'처럼 축약형을, 명세서 예시는 '서울특별시 …'처럼
// 전체 표기를 쓰므로 양쪽 표기를 모두 받는다.
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

// 매칭에 실패하면 undefined를 돌려준다. 임의의 ID를 넣어 보내면 백엔드가
// REGION4041로 거절하므로, 호출부가 제출을 막고 장소를 다시 고르게 한다.
export function resolveBusinessRegionId(
  address: string,
  regions: readonly Region[] | undefined
): number | undefined {
  if (!regions) {
    return undefined;
  }

  const [addressPrefix] = address.trim().split(/\s+/);

  if (!addressPrefix) {
    return undefined;
  }

  const regionName = REGION_NAME_BY_ADDRESS_PREFIX[addressPrefix];

  if (!regionName) {
    return undefined;
  }

  return regions.find((region) => region.name === regionName)?.regionId;
}
