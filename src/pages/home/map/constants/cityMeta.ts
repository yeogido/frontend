/**
 * 지역(도/광역시/시/군/구) 클릭 시 이동할 경로를 만드는 빌더.
 *
 * - 사진 없음: 지역 종합 정보 페이지(RegionInfoPage)로 이동
 * - 사진 있음: 여행 기록 상세 페이지(/travel-record/:folderId)로 이동
 */

import { normalizeRegionName } from '../../../../constants/regions';

export function buildRecordPath(folderId: string): string {
  return `/travel-record/${encodeURIComponent(folderId)}`;
}

export function buildSearchPath(regionName: string): string {
  const normalized = normalizeRegionName(regionName);
  return `/region-info/${encodeURIComponent(normalized)}`;
}
