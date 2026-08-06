export const REGION_CITY_IDS = [
  'seoul',
  'busan',
  'daegu',
  'gwangju',
  'incheon',
  'daejeon',
  'ulsan',
  'sejong',
  'gyeonggi',
  'gangwon',
  'chungbuk',
  'chungnam',
  'gyeongbuk',
  'gyeongnam',
  'jeonbuk',
  'jeonnam',
  'jeju',
] as const;

export type RegionCityId = (typeof REGION_CITY_IDS)[number];

export interface RegionCity {
  id: RegionCityId;
  name: string;
}

export const DEFAULT_REGION_CITY_ID = 'seoul';

// 시/도 목록. 하위 지역(구/군/동)은 더 이상 정적 데이터가 아니라
// GET /regions/{regionId}/sub-regions 로 실시간 조회한다.
export const regionCities: readonly RegionCity[] = [
  { id: 'seoul', name: '서울' },
  { id: 'busan', name: '부산' },
  { id: 'daegu', name: '대구' },
  { id: 'gwangju', name: '광주' },
  { id: 'incheon', name: '인천' },
  { id: 'daejeon', name: '대전' },
  { id: 'ulsan', name: '울산' },
  { id: 'sejong', name: '세종' },
  { id: 'gyeonggi', name: '경기' },
  { id: 'gangwon', name: '강원' },
  { id: 'chungbuk', name: '충북' },
  { id: 'chungnam', name: '충남' },
  { id: 'gyeongbuk', name: '경북' },
  { id: 'gyeongnam', name: '경남' },
  { id: 'jeonbuk', name: '전북' },
  { id: 'jeonnam', name: '전남' },
  { id: 'jeju', name: '제주' },
];

export const regionSearchKeywords = regionCities.map((city) => city.name);

/**
 * 지도 GeoJSON 등에서 쓰는 공식 행정구역명(예: "경기도")을 지역 API가 쓰는
 * 짧은 이름(예: "경기")으로 정규화한다. 시/군/구 단위 이름은 이미 API와
 * 형태가 같아 변환이 필요 없다.
 */
const OFFICIAL_PROVINCE_NAME_MAP: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전라북도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
  // 지도 GeoJSON 원본 데이터에 있는 오타("특별별")까지 함께 매핑해 둔다.
  제주특별별자치도: '제주',
};

export function normalizeRegionName(name: string): string {
  return OFFICIAL_PROVINCE_NAME_MAP[name] ?? name;
}
