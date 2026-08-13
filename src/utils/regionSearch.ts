import { normalizeRegionName } from '../constants/regions.ts';

import type { RegionSearchResult } from '../types/region.type';

const splitRegionPath = (regionPath: string) =>
  regionPath.trim().split(/\s+/).filter(Boolean);

export const getRegionSearchKeyword = (regionPath: string) =>
  splitRegionPath(regionPath).at(-1) ?? regionPath;

/** URL에 전달된 지역 ID는 양의 정수일 때만 신뢰한다. */
export const getExplicitRegionId = (value: string | null) => {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }

  const regionId = Number(value);

  return Number.isSafeInteger(regionId) && regionId > 0 ? regionId : undefined;
};

/**
 * 검색 응답의 fullName은 정식 행정구역명("부산광역시 중구")인데 URL로 들어오는
 * 지역 경로는 짧은 이름("부산 중구")이라 두 문자열은 그대로 비교되지 않는다.
 * fullName의 첫 토큰을 짧은 이름으로 정규화해서 맞춘다.
 */
const getProvinceName = (fullName: string) => {
  const [provinceOfficialName] = splitRegionPath(fullName);

  return provinceOfficialName
    ? normalizeRegionName(provinceOfficialName)
    : undefined;
};

/**
 * 검색 제안은 동명 지역을 구분하려고 fullName("대전광역시 동구")을 보여주지만,
 * 최근 검색어와 URL(region=)은 짧은 이름("대전 동구")을 쓴다. 첫 토큰만 짧은
 * 이름으로 바꿔 표기를 한 형태로 모은다. 그러지 않으면 같은 지역이 두 형태로
 * 쌓이고, 시/도 이름이 안 맞아 지역 필터로도 해석되지 않는다.
 */
export const toShortRegionPath = (regionPath: string) => {
  const [provinceOfficialName, ...rest] = splitRegionPath(regionPath);

  if (!provinceOfficialName) {
    return regionPath.trim();
  }

  return [normalizeRegionName(provinceOfficialName), ...rest].join(' ');
};

/**
 * "중구"·"동구"·"고성군"처럼 이름이 같은 시/군/구가 여러 시/도에 존재한다.
 * 이름만으로 `find`하면 응답 순서상 항상 서울(또는 첫 시/도)이 잡혀서 엉뚱한
 * 지역의 결과를 조용히 보여주게 되므로, "부산 중구"처럼 시/도 토큰이 함께
 * 온 경우에는 시/도까지 일치하는 후보만 인정한다. 하나로 좁혀지지 않으면
 * 추측하지 않고 undefined를 돌려 호출부가 "지역 없음"으로 처리하게 한다.
 */
export const findRegionSearchMatch = (
  keyword: string,
  regions: readonly RegionSearchResult[]
) => {
  // fullName은 정식 명칭이라 그 자체로 지역이 하나로 특정된다.
  const fullNameMatch = regions.find((region) => region.fullName === keyword);

  if (fullNameMatch) {
    return fullNameMatch;
  }

  const tokens = splitRegionPath(keyword);
  const regionName = tokens.at(-1);
  const namedRegions = regions.filter((region) => region.name === regionName);

  if (tokens.length > 1) {
    const provinceName = tokens[0];
    const matchedRegions = namedRegions.filter(
      (region) => getProvinceName(region.fullName) === provinceName
    );

    return matchedRegions.length === 1 ? matchedRegions[0] : undefined;
  }

  // 시/도 토큰이 없으면(예: /region-info/중구 직접 진입) 구분할 근거가 없다.
  // 후보가 하나일 때만 신뢰하고, 여럿이면 마찬가지로 포기한다.
  return namedRegions.length === 1 ? namedRegions[0] : undefined;
};
