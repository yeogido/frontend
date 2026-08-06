import { useQuery } from '@tanstack/react-query';

import { searchRegions } from '../../../apis/regions.api';
import { useRegions } from '../../../hooks/useRegions';

/**
 * URL에 담긴 지역 이름(시/도든 시/군/구든)을 실제 regionId로 변환한다.
 * 최상위 지역이면 /regions 목록에서 바로 찾고, 그게 아니면(시/군/구 등)
 * /regions/search 로 하위 지역까지 포함해서 찾는다.
 */
export function useResolvedRegion(rawName: string | undefined) {
  const regionsQuery = useRegions();

  const topLevelMatch = rawName
    ? regionsQuery.data?.regions.find((region) => region.name === rawName)
    : undefined;

  const searchEnabled =
    Boolean(rawName) && !topLevelMatch && regionsQuery.isSuccess;

  const searchQuery = useQuery({
    queryKey: ['regions', 'search', rawName],
    queryFn: () => searchRegions(rawName as string),
    enabled: searchEnabled,
    staleTime: 5 * 60_000,
  });

  const searchMatch = searchQuery.data?.find(
    (region) => region.name === rawName
  );

  const isPending =
    regionsQuery.isPending || (searchEnabled && searchQuery.isPending);
  const isError =
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
