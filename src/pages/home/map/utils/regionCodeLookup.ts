import koreaCityJson from '../assets/korea-city.json' with { type: 'json' };
import koreaProvinceJson from '../assets/korea-province.json' with { type: 'json' };

interface MapRegionFeatureProperties {
  code?: string;
  name?: string;
}

const buildNameToCodeMap = (geoJson: GeoJSON.FeatureCollection) => {
  const map = new Map<string, string>();

  geoJson.features.forEach((feature) => {
    const properties = feature.properties as MapRegionFeatureProperties | null;

    if (properties?.name && properties.code) {
      map.set(properties.name, properties.code);
    }
  });

  return map;
};

const cityCodeByName = buildNameToCodeMap(
  koreaCityJson as GeoJSON.FeatureCollection,
);
const provinceCodeByName = buildNameToCodeMap(
  koreaProvinceJson as GeoJSON.FeatureCollection,
);

export interface MapRegionMatch {
  /** korea-city.json / korea-province.json properties.name과 동일한 값 */
  name: string;
  /** 같은 properties.code. 시/군/구는 4자리, 광역시/도는 2자리. */
  code: string;
}

/**
 * 지역명 후보(짧은 이름 -> 전체 이름 순)로 지도 geojson에서 일치하는
 * 시군구(시/군/구 도형) 또는 광역시/도 도형을 찾는다.
 * 광역시 산하 구 도형은 지도에서 항상 숨겨져 있어, 광역시는
 * fullName(예: '부산광역시') 매칭을 통해서만 도 단위로 잡힌다.
 */
export function findMapRegionByNames(
  candidates: ReadonlyArray<string | undefined>,
): MapRegionMatch | null {
  for (const candidate of candidates) {
    if (!candidate) continue;

    const cityCode = cityCodeByName.get(candidate);
    if (cityCode) return { name: candidate, code: cityCode };

    const provinceCode = provinceCodeByName.get(candidate);
    if (provinceCode) return { name: candidate, code: provinceCode };
  }

  return null;
}
