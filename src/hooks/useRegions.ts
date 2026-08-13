import { useQuery } from '@tanstack/react-query';

import { getRegion, getRegions } from '../apis/regions.api';

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
  });
}

export function useRegion(regionId?: number) {
  return useQuery({
    queryKey: ['region', regionId],
    queryFn: () => getRegion(regionId as number),
    enabled: regionId !== undefined,
  });
}