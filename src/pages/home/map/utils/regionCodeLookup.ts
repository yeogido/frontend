import koreaCityJson from '../assets/korea-city.json' with { type: 'json' };
import koreaProvinceJson from '../assets/korea-province.json' with { type: 'json' };

interface MapRegionFeatureProperties {
  code?: string;
  name?: string;
}

/**
 * korea-province.json에 남아 있는 지역명 문제를 보정하기 위한 별칭.
 *
 * - `제주특별자치도`: 지도 데이터에 '별'이 중복된 오타(`제주특별별자치도`)로 들어 있다.
 * - `강원특별자치도`, `전북특별자치도`: 지도 데이터가 개편 전 명칭을 쓰고 있다.
 *
 * Region API가 어느 쪽 표기를 쓰더라도 같은 도형을 찾도록 한쪽으로 모은다.
 */
const PROVINCE_NAME_ALIASES: Record<string, string> = {
  제주특별자치도: '제주특별별자치도',
  강원특별자치도: '강원도',
  전북특별자치도: '전라북도',
};

const PROVINCE_SUFFIX_PATTERN =
  /(특별자치도|특별자치시|특별시|광역시|자치도|도|시)$/;

const toCanonicalProvinceName = (name: string) =>
  PROVINCE_NAME_ALIASES[name] ?? name;

/** '강원도'와 '강원특별자치도'가 같은 값이 되도록 행정 접미사를 떼어낸다. */
const toProvinceStem = (name: string) =>
  toCanonicalProvinceName(name).replace(PROVINCE_SUFFIX_PATTERN, '');

const provinceCodeByName = new Map<string, string>();
const provinceNameByCode = new Map<string, string>();

(koreaProvinceJson as GeoJSON.FeatureCollection).features.forEach((feature) => {
  const properties = feature.properties as MapRegionFeatureProperties | null;

  if (properties?.name && properties.code) {
    provinceCodeByName.set(properties.name, properties.code);
    provinceNameByCode.set(properties.code, properties.name);
  }
});

/**
 * 같은 이름의 시/군/구가 여러 도에 존재하므로(예: 고성군은 강원·경남에,
 * 중구는 여러 광역시에) 이름 하나에 코드를 배열로 모아 둔다.
 */
const cityCodesByName = new Map<string, string[]>();

(koreaCityJson as GeoJSON.FeatureCollection).features.forEach((feature) => {
  const properties = feature.properties as MapRegionFeatureProperties | null;

  if (!properties?.name || !properties.code) {
    return;
  }

  const codes = cityCodesByName.get(properties.name);

  if (codes) {
    codes.push(properties.code);
    return;
  }

  cityCodesByName.set(properties.name, [properties.code]);
});

const findProvinceCode = (provinceName: string) => {
  const canonicalName = toCanonicalProvinceName(provinceName);

  return provinceCodeByName.get(canonicalName);
};

/**
 * 이름이 겹치는 시/군/구 중 fullName의 도 이름과 일치하는 하나를 고른다.
 * 시군구 코드 앞 두 자리가 도 코드라는 점을 이용한다.
 */
const resolveCityCodeByProvince = (
  cityCodes: readonly string[],
  fullName: string | undefined,
) => {
  const provinceName = fullName?.split(' ')[0];

  if (!provinceName) {
    return null;
  }

  const provinceStem = toProvinceStem(provinceName);
  const matchedCodes = cityCodes.filter((cityCode) => {
    const candidateProvinceName = provinceNameByCode.get(cityCode.slice(0, 2));

    return (
      candidateProvinceName !== undefined &&
      toProvinceStem(candidateProvinceName) === provinceStem
    );
  });

  return matchedCodes.length === 1 ? matchedCodes[0] : null;
};

export interface MapRegionMatch {
  /** korea-city.json / korea-province.json properties.name과 동일한 값 */
  name: string;
  /** 같은 properties.code. 시/군/구는 4자리, 광역시/도는 2자리. */
  code: string;
}

/**
 * Region API의 지역명으로 지도 geojson에서 대응하는 시/군/구 또는
 * 광역시/도 도형을 찾는다.
 *
 * 광역시 산하 구 도형은 지도에서 항상 숨겨져 있어, 광역시는
 * fullName(예: '부산광역시') 매칭을 통해 도 단위로 잡힌다.
 *
 * 이름이 겹치는 지역은 fullName의 도 이름으로 구분하며, 끝내 하나로
 * 좁혀지지 않으면 엉뚱한 도형에 사진을 채우지 않도록 null을 반환한다.
 */
export function findMapRegion({
  name,
  fullName,
}: {
  name?: string;
  fullName?: string;
}): MapRegionMatch | null {
  for (const candidate of [name, fullName]) {
    if (!candidate) continue;

    const cityCodes = cityCodesByName.get(candidate);

    if (cityCodes?.length === 1) {
      return { name: candidate, code: cityCodes[0] };
    }

    if (cityCodes && cityCodes.length > 1) {
      const resolvedCityCode = resolveCityCodeByProvince(cityCodes, fullName);

      if (resolvedCityCode) {
        return { name: candidate, code: resolvedCityCode };
      }

      continue;
    }

    const provinceCode = findProvinceCode(candidate);

    if (provinceCode) {
      return { name: candidate, code: provinceCode };
    }
  }

  return null;
}
