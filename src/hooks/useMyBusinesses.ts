import { useQuery } from '@tanstack/react-query';

import { getMyBusinesses } from '../apis/users.api';

export const MY_BUSINESSES_QUERY_KEY = ['myBusinesses'];

export function useMyBusinesses(enabled = true) {
  return useQuery({
    queryKey: MY_BUSINESSES_QUERY_KEY,
    queryFn: getMyBusinesses,
    enabled,
  });
}
