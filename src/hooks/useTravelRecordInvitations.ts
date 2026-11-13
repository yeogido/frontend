import { useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getTravelRecordInvitations } from '../apis/travelRecords.api';
import { normalizeApiError } from '../apis/common';
import { useAuthStore } from '../store/auth.store';
import { getReceivedInvitationsFromPages } from '../pages/travel-record/mappers/travelRecordInvitationMapper';

export const getTravelRecordInvitationsQueryKey = (
  userId: number | null,
  authGeneration: number
) => ['travelRecordInvitations', userId, authGeneration] as const;

export function useTravelRecordInvitations({ enabled = true } = {}) {
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const queryClient = useQueryClient();
  const recoveredCursors = useRef(new Set<string>());
  const queryKey = useMemo(
    () => getTravelRecordInvitationsQueryKey(userId, authGeneration),
    [userId, authGeneration]
  );
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      getTravelRecordInvitations({ size: 10, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (page) =>
      page.hasNext ? (page.cursorId ?? undefined) : undefined,
    enabled: enabled && userId !== null,
    retry: false,
  });
  const invalidCursor =
    query.isError &&
    normalizeApiError(query.error).code === 'TRAVEL_RECORD4006';
  const lastCursor =
    query.data?.pages.at(-1)?.cursorId ?? query.data?.pageParams.at(-1);
  useEffect(() => {
    if (!enabled || !invalidCursor || lastCursor == null) return;
    const recoveryKey = `${userId}:${authGeneration}:${lastCursor}`;
    // 삭제된 커서를 반복 재요청하지 않는다. 같은 커서의 자동 복구는 한 번뿐이다.
    if (recoveredCursors.current.has(recoveryKey)) return;
    recoveredCursors.current.add(recoveryKey);
    void queryClient.resetQueries({ queryKey, exact: true });
  }, [
    enabled,
    invalidCursor,
    lastCursor,
    userId,
    authGeneration,
    queryClient,
    queryKey,
  ]);

  const invitations = useMemo(
    () => getReceivedInvitationsFromPages(query.data?.pages),
    [query.data?.pages]
  );
  return {
    ...query,
    invitations,
    retry: () => {
      // 자동 복구 제한에 걸렸거나 백그라운드 재조회 중 커서가 삭제되어도
      // 사용자가 누르는 재시도는 언제나 첫 페이지에서 다시 시작할 수 있다.
      if (invalidCursor)
        return queryClient.resetQueries({ queryKey, exact: true });
      if (query.isFetchNextPageError) return query.fetchNextPage();
      return query.refetch();
    },
  };
}
