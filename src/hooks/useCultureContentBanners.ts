import { useQuery } from '@tanstack/react-query';

import { getCultureContentBanners } from '../apis/contents.api';

export function useCultureContentBanners() {
  return useQuery({
    queryKey: ['cultureContentBanners'],
    queryFn: getCultureContentBanners,
  });
}
