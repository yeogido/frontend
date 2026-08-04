import koreaCityJson from './korea-city.json' with { type: 'json' };
import {
  mergeRegionFeatures,
  type RegionMergeSpec,
} from '../utils/mergeRegionFeatures.ts';

import type { KoreaCityGeoJson } from '../types/map';

/**
 * 지도 데이터가 통합 전 경계를 그대로 갖고 있는 지역.
 *
 * korea-city.json은 통계청 행정경계를 단순화한 것인데 갱신이 멈춰 있어,
 * 통합된 지 오래인 지역이 아직 여러 도형으로 나뉘어 있다. 원본 JSON은
 * 512KB 단일 라인이라 직접 고치면 변경 내역을 확인할 수 없으므로,
 * 불러올 때 합친다.
 */
const MERGED_REGIONS: readonly RegionMergeSpec[] = [
  {
    // 2010년 창원시 · 마산시 · 진해시가 통합 창원시가 되었다.
    code: '4811',
    name: '창원시',
    memberCodes: ['4811', '4816', '4819'],
  },
  {
    // 2014년 청원군이 청주시에 편입되었다.
    code: '4311',
    name: '청주시',
    memberCodes: ['4311', '4371'],
  },
];

/**
 * 소속 광역단체가 바뀐 지역. 시군구 코드 앞 두 자리가 소속 광역단체라,
 * 코드를 옮기면 지도 전체가 새 소속을 따른다.
 */
const REASSIGNED_CODES: Record<string, string> = {
  // 2023년 군위군이 경상북도에서 대구광역시로 편입되었다.
  4772: '2772',
};

const reassignCodes = (geoJson: KoreaCityGeoJson): KoreaCityGeoJson => ({
  ...geoJson,
  features: geoJson.features.map((feature) => {
    const code = REASSIGNED_CODES[feature.properties.code];

    return code
      ? { ...feature, properties: { ...feature.properties, code } }
      : feature;
  }),
});

/** 행정구역 통합과 소속 변경을 반영한 시/군/구 경계 */
export const koreaCity = mergeRegionFeatures(
  reassignCodes(koreaCityJson as KoreaCityGeoJson),
  MERGED_REGIONS,
);
