import { useQuery } from '@tanstack/react-query';

import { searchRegions } from '../../../apis/regions.api';
import { useRegions } from '../../../hooks/useRegions';
import {
  findRegionSearchMatch,
  getRegionSearchKeyword,
} from '../../../utils/regionSearch';

/**
 * URL에 담긴 지역 이름(시/도든 시/군/구든)을 실제 regionId로 변환한다.
 *
 * "중구"/"동구"처럼 여러 시/도에 같은 이름의 하위 지역이 존재할 수 있어,
 * 이름만으로는 어느 지역인지 확정할 수 없다. 호출부(예: 지역 검색 페이지)가
 * 이미 정확한 regionId를 알고 있다면 explicitRegionId로 넘겨받아 그걸
 * 그대로 쓰고, 없을 때만(예: 홈 지도 클릭, URL 직접 진입) 이름 검색으로
 * 추정한다.
 */
export function useResolvedRegion(
  rawName: string | undefined,
  explicitRegionId?: number
) {
  const hasExplicitRegionId = explicitRegionId !== undefined;
  const needsResolution = !hasExplicitRegionId && Boolean(rawName);

  // 백엔드는 "서울 강남구" 같은 경로 전체로는 아무것도 찾지 못하므로 마지막
  // 토큰만 보낸다. queryKey에도 실제로 보내는 키워드를 그대로 써야 한다.
  // 경로 전체를 키로 쓰면, 같은 ['regions','search', X] 키로 경로 전체를
  // 조회하는 지역 검색창(useCourseRegionSearch)과 캐시가 겹쳐 서로의 결과를
  // 가져다 쓰게 된다(빈 배열 → 잘못된 '지역 없음').
  const searchKeyword = rawName ? getRegionSearchKeyword(rawName) : undefined;

  const regionsQuery = useRegions();

  const topLevelMatch =
    !hasExplicitRegionId && rawName
      ? regionsQuery.data?.regions.find((region) => region.name === rawName)
      : undefined;

  const searchEnabled =
    needsResolution && !topLevelMatch && regionsQuery.isSuccess;

  // hasExplicitRegionId일 때도 훅 호출 순서를 항상 동일하게 유지하기 위해
  // useQuery는 무조건 호출하고 enabled로만 실행 여부를 가른다.
  const searchQuery = useQuery({
    queryKey: ['regions', 'search', searchKeyword],
    queryFn: () => searchRegions(searchKeyword as string),
    enabled: searchEnabled,
    staleTime: 5 * 60_000,
  });

  if (hasExplicitRegionId) {
    return {
      regionId: explicitRegionId,
      isPending: false,
      isError: false,
    };
  }

  const searchMatch = searchQuery.data
    ? findRegionSearchMatch(rawName as string, searchQuery.data)
    : undefined;

  const isPending =
    needsResolution &&
    (regionsQuery.isPending || (searchEnabled && searchQuery.isPending));
  const isError =
    needsResolution &&
    !isPending &&
    (regionsQuery.isError ||
      (searchEnabled && searchQuery.isError) ||
      (!topLevelMatch && !searchMatch));

  return {
    regionId: topLevelMatch?.regionId ?? searchMatch?.regionId,
    isPending,
    isError,
  };
}
