import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTravelRecordVisibility } from '../apis/travelRecords.api';
import { useAuthStore } from '../store/auth.store';
import { requireTravelRecordVersion } from '../pages/travel-record/utils/editVersion';
import { TRAVEL_RECORD_MAP_QUERY_KEY } from '../pages/travel-record/utils/mapAuth';
import type { TravelRecordFolder } from '../pages/travel-record/types';
import { toTravelRecordVisibility } from '../pages/travel-record/mappers/travelRecordVisibility';
import type { TravelRecordVisibilityUpdateRequest } from '../types/travelRecord.type';

/** 상세에서 읽은 버전으로 공개범위 전환. 충돌 시 버전을 바꿔 자동 재시도하지 않는다. */
export function useUpdateTravelRecordVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      travelRecordId,
      version,
      visibility,
    }: {
      travelRecordId: number;
    } & TravelRecordVisibilityUpdateRequest) =>
      updateTravelRecordVisibility(travelRecordId, {
        visibility,
        version: requireTravelRecordVersion(version),
      }),
    retry: false,
    onMutate: () => {
      const { userId, authGeneration } = useAuthStore.getState();
      return { userId, authGeneration };
    },
    onSuccess: (result, { travelRecordId }, session) => {
      const current = useAuthStore.getState();
      if (
        !session ||
        current.userId !== session.userId ||
        current.authGeneration !== session.authGeneration
      )
        return;
      queryClient.setQueryData<TravelRecordFolder>(
        [
          'travelRecord',
          travelRecordId,
          'folder',
          session.userId,
          session.authGeneration,
        ],
        (folder) =>
          folder
            ? {
                ...folder,
                visibility: toTravelRecordVisibility(result.visibility),
                version: result.version,
              }
            : folder
      );
      void queryClient.invalidateQueries({
        queryKey: ['travelRecord', travelRecordId],
      });
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
      void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
      void queryClient.invalidateQueries({
        queryKey: TRAVEL_RECORD_MAP_QUERY_KEY,
      });
    },
  });
}
