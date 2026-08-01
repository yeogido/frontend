import { useQuery } from '@tanstack/react-query';

import { getRegions } from '../apis/regions.api';

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
  });
}