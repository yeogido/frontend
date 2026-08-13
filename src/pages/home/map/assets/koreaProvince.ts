import koreaProvinceJson from './korea-province.json' with { type: 'json' };
import { koreaCity } from './koreaCity.ts';
import { unionFeatures } from '../utils/mergeRegionFeatures.ts';

import type { FeatureCollection } from 'geojson';

/**
 * 시/군/구 경계에서 다시 만들어야 하는 광역단체 코드.
 *
 * korea-province.json의 도 도형은 소속 시/군/구를 모두 합친 것과 정확히
 * 같다. 그래서 소속이 바뀐 지역이 있으면 도 도형도 어긋나는데, 바뀐 쪽
 * 시/군/구를 다시 합치면 새 경계가 된다.
 *
 * 27 대구 · 47 경북: 2023년 군위군이 경북에서 대구로 넘어갔다. 대구는
 * 군위 면적이 더해지고, 경북은 그만큼 빠진다.
 */
const REBUILT_PROVINCE_CODES = ['27', '47'];

const rebuildProvinces = (
  geoJson: FeatureCollection,
): FeatureCollection => ({
  ...geoJson,
  features: geoJson.features.map((feature) => {
    const code = (feature.properties as { code?: string } | null)?.code;

    if (!code || !REBUILT_PROVINCE_CODES.includes(code)) {
      return feature;
    }

    const geometry = unionFeatures(
      koreaCity.features.filter((city) =>
        city.properties.code.startsWith(code),
      ),
    );

    return geometry ? { ...feature, geometry } : feature;
  }),
});

/** 소속 변경을 반영한 광역시/도 경계 */
export const koreaProvince = rebuildProvinces(
  koreaProvinceJson as FeatureCollection,
);
