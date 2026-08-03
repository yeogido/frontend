import koreaProvinceJson from '../assets/korea-province.json' with { type: 'json' };

// 이름이 특별시/광역시로 끝나는 지역 = 구 단위 세부 구분선을 감추고
// 싶은 대상. 하드코딩 목록 대신 province geojson에서 자동으로 판별한다.
// (제주특별자치도의 "특별자치도", 세종특별자치시의 "특별자치시"는
// 이 패턴에 걸리지 않도록 "특별시" 또는 "광역시"로만 한정한다.)
const METRO_NAME_PATTERN = /(특별시|광역시)$/;

const provinceGeoJson = koreaProvinceJson as GeoJSON.FeatureCollection;

export const METRO_PROVINCE_CODES: ReadonlySet<string> = new Set(
  provinceGeoJson.features
    .map((feature) => {
      const properties = feature.properties as {
        code?: string;
        name?: string;
      } | null;

      if (!properties?.code || !properties?.name) {
        return null;
      }

      return METRO_NAME_PATTERN.test(properties.name)
        ? properties.code
        : null;
    })
    .filter((code): code is string => Boolean(code)),
);

/**
 * city geojson의 code(4자리 시군구코드)가 광역시/특별시 소속인지
 * 판별한다 (도 geojson의 2자리 시도코드를 접두어로 비교).
 * 예: '11'(서울) → '1111'(종로구), '1174'(강동구) 등이 모두 매치.
 */
export function isMetroCityCode(code: string | undefined | null) {
  if (!code) {
    return false;
  }

  for (const metroCode of METRO_PROVINCE_CODES) {
    if (code.startsWith(metroCode)) {
      return true;
    }
  }

  return false;
}