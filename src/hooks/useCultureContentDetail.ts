import { useQuery } from '@tanstack/react-query';

import { getCultureContentDetail } from '../apis/contents.api';
import { useAuthStore } from '../store/auth.store';

export function useCultureContentDetail(contentId: number) {
  const authGeneration = useAuthStore((state) => state.authGeneration);

  return useQuery({
    queryKey: ['cultureContent', authGeneration, contentId],
    queryFn: () => getCultureContentDetail(contentId),
    enabled: Number.isInteger(contentId) && contentId > 0,
  });
}
