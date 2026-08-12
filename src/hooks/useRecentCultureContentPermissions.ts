import { useQueries } from '@tanstack/react-query';

import { getCultureContentDetail } from '../apis/contents.api';
import { useAuthStore } from '../store/auth.store';

export function useRecentCultureContentPermissions(
  contentIds: readonly number[]
): ReadonlyMap<number, boolean> {
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const results = useQueries({
    queries: contentIds.map((contentId) => ({
      queryKey: ['cultureContent', authGeneration, contentId],
      queryFn: () => getCultureContentDetail(contentId),
    })),
  });

  return new Map(
    results.flatMap((result, index) =>
      result.data ? [[contentIds[index], result.data.canManage] as const] : []
    )
  );
}
