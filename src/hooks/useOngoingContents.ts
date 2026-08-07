import { useQuery } from '@tanstack/react-query';

import { getOngoingContents } from '../apis/contents.api';

export function useOngoingContents() {
  return useQuery({
    queryKey: ['contents', 'ongoing'],
    queryFn: getOngoingContents,
  });
}
