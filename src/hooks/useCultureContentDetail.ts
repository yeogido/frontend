import { useQuery } from '@tanstack/react-query';

import { getCultureContentDetail } from '../apis/contents.api';

export function useCultureContentDetail(contentId: number) {
  return useQuery({
    queryKey: ['cultureContent', contentId],
    queryFn: () => getCultureContentDetail(contentId),
    enabled: Number.isInteger(contentId) && contentId > 0,
  });
}
