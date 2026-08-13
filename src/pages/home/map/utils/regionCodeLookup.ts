import { koreaCity } from '../assets/koreaCity.ts';
import { koreaProvince } from '../assets/koreaProvince.ts';

import { isMetroCityCode } from './metroCityCodes.ts';

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

(koreaProvince as GeoJSON.FeatureCollection).features.forEach((feature) => {
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
const cityNameByCode = new Map<string, string>();

(koreaCity as GeoJSON.FeatureCollection).features.forEach((feature) => {
  const properties = feature.properties as MapRegionFeatureProperties | null;

  if (!properties?.name || !properties.code) {
    return;
  }

  cityNameByCode.set(properties.code, properties.name);

  const codes = cityCodesByName.get(properties.name);

  if (codes) {
    codes.push(properties.code);
    return;
  }

  cityCodesByName.set(properties.name, [properties.code]);
});

const CITY_SUFFIX_SWAP: Record<string, string> = { 시: '군', 군: '시' };

/**
 * 군에서 시로 승격된 지역(여주군 → 여주시, 당진군 → 당진시)은 지도
 * 데이터가 승격 전 이름을 그대로 쓰고 있어 이름으로는 찾지 못한다.
 * 이 데이터에는 어간이 같은데 접미사만 다른 지역이 없으므로, 시↔군을
 * 바꿔 한 번 더 찾아도 엉뚱한 지역에 걸리지 않는다.
 */
const findCityCodes = (cityName: string) => {
  const codes = cityCodesByName.get(cityName);

  if (codes) {
    return codes;
  }

  const swappedSuffix = CITY_SUFFIX_SWAP[cityName.slice(-1)];

  if (!swappedSuffix) {
    return undefined;
  }

  return cityCodesByName.get(`${cityName.slice(0, -1)}${swappedSuffix}`);
};

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

const PROVINCE_CODE_LENGTH = 2;

/**
 * 지도에 사진을 채울 때 쓸 도형을 고른다.
 *
 * 도형 이름은 항상 코드로부터 역산한다. Region API의 지역명(`강원특별자치도`)과
 * 지도 데이터의 지역명(`강원도`)이 다른 경우가 있어, 이름을 그대로 넘기면
 * 도형을 못 찾아 사진이 사라진다. 코드는 별칭 보정을 거쳐 이미 정확하므로
 * 코드를 신뢰한다.
 *
 * 광역시/특별시 산하 구는 지도에서 도형 자체가 항상 숨겨져 있어, 그대로
 * 두면 어느 줌에서도 사진을 그릴 자리가 없다. 이런 지역은 부모 광역시
 * 도형으로 올려서 광역시 전체가 사진으로 채워지게 한다.
 *
 * 여기서 정한 이름은 지도 내부 조회 키로만 쓰인다. 기록 상세나 폴더
 * 미리보기에 쓰는 표시용 이름(`folder.regionName`)은 건드리지 않는다.
 */
export function toMapShapeRegion({
  name,
  code,
}: {
  name: string;
  code: string;
}): { name: string; code: string } {
  if (code.length <= PROVINCE_CODE_LENGTH) {
    return { name: provinceNameByCode.get(code) ?? name, code };
  }

  if (isMetroCityCode(code)) {
    const provinceCode = code.slice(0, PROVINCE_CODE_LENGTH);
    const provinceName = provinceNameByCode.get(provinceCode);

    return provinceName
      ? { name: provinceName, code: provinceCode }
      : { name, code };
  }

  return { name: cityNameByCode.get(code) ?? name, code };
}

export interface MapRegionMatch {
  /** korea-city.json / korea-province.json properties.name과 동일한 값 */
  name: string;
  /** 같은 properties.code. 시/군/구는 4자리, 광역시/도는 2자리. */
  code: string;
}

/** 이름 하나로 도형을 찾는다. 못 찾으면 null. */
const findShapeByName = (
  candidate: string,
  fullName: string | undefined,
): MapRegionMatch | null => {
  // 도/광역시를 시/군/구보다 먼저 본다. '세종특별자치시'는 도 목록(36)과
  // 시 목록(4473, 충남 접두사) 양쪽에 있는데, 시를 먼저 잡으면 세종 기록이
  // 충남 소속 도형에 붙는다. 도 목록에는 17개 정식 명칭만 있어 시/군/구
  // 이름과 겹칠 일이 없으므로 먼저 봐도 안전하다.
  const provinceCode = findProvinceCode(candidate);

  if (provinceCode) {
    return { name: candidate, code: provinceCode };
  }

  const cityCodes = findCityCodes(candidate);

  if (cityCodes?.length === 1) {
    return { name: candidate, code: cityCodes[0] };
  }

  if (cityCodes && cityCodes.length > 1) {
    const resolvedCityCode = resolveCityCodeByProvince(cityCodes, fullName);

    if (resolvedCityCode) {
      return { name: candidate, code: resolvedCityCode };
    }
  }

  return null;
};

/**
 * 자기 도형이 없는 지역을 상위 행정구역 도형으로 올린다.
 *
 * 지도 데이터에는 읍·면·동이 없고, 최근 신설된 구(인천 검단구 등)도 아직
 * 없다. 그대로 두면 regionCode가 비어 사진이 지도에서 통째로 사라지므로,
 * fullName을 뒤에서부터 거슬러 올라가며 그릴 수 있는 도형을 찾는다.
 * (예: '제주특별자치도 제주시 구좌읍' → 제주시, '인천광역시 검단구' → 인천)
 */
const findAncestorShape = (fullName: string | undefined) => {
  const tokens = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  // 마지막 토큰은 자기 자신이라 이미 실패했다.
  for (let index = tokens.length - 2; index >= 0; index -= 1) {
    const match = findShapeByName(tokens[index], fullName);

    if (match) {
      return match;
    }
  }

  return null;
};

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

    const match = findShapeByName(candidate, fullName);

    if (match) {
      return match;
    }
  }

  return findAncestorShape(fullName);
}
