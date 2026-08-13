import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncTourContents } from '../apis/tourContents.api';

export function useSyncTourContents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncTourContents,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cultureContents'] });
    },
  });
}
