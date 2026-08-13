import { useQueries } from '@tanstack/react-query';

import { getCultureContentDetail } from '../../../apis/contents.api';
import { createRequestQueue } from '../../../hooks/utils/createRequestQueue';
import { getFestivalCategoryLabel } from '../../festival/constants/filters';

const EVENT_CATEGORY_STALE_TIME = 1000 * 60 * 5;
const EVENT_CATEGORY_GC_TIME = 1000 * 60 * 30;
const EVENT_CATEGORY_CONCURRENCY = 4;
const queueEventCategoryRequest = createRequestQueue(
  EVENT_CATEGORY_CONCURRENCY
);

/**
 * 좋아요 목록 응답엔 행사 분류(체험/전시/공연/축제)가 없어 상세 조회로
 * 보강한다. usePlaceOpeningHours와 같은 패턴(useQueries + 동시성 큐).
 */
export function useLikedEventCategories(
  eventIds: readonly number[]
): ReadonlyMap<number, string> {
  const queries = useQueries({
    queries: eventIds.map((contentId) => ({
      queryKey: ['likedEventCategory', contentId],
      queryFn: () => queueEventCategoryRequest(() => getCultureContentDetail(contentId)),
      staleTime: EVENT_CATEGORY_STALE_TIME,
      gcTime: EVENT_CATEGORY_GC_TIME,
      retry: false,
    })),
  });

  return new Map(
    eventIds.flatMap((id, index) => {
      const category = queries[index]?.data?.category;

      return category ? [[id, getFestivalCategoryLabel(category)] as const] : [];
    })
  );
}
