import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchRecentFestivals } from '../../../apis/festivals';

function useRecentFestivals() {
  return useInfiniteQuery({
    queryKey: ['recentFestivals'],
    queryFn: ({ pageParam }) => fetchRecentFestivals({ page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useRecentFestivals;
