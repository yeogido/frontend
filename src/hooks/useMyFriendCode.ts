import { useQuery } from '@tanstack/react-query';

import type { NormalizedApiError } from '../apis/common';
import { getMyFriendCode } from '../apis/friends.api';
import { getValidQrToken } from '../pages/friends/utils/friendQrCountdown';
import { useAuthStore } from '../store/auth.store';
import type { MyFriendCode } from '../types/friend.type';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

export const getMyFriendCodeQueryKey = (
  userId: number | null
): [string, number | null] => ['friendCode', userId];

// qrToken이 없는 응답(백엔드 미배포)은 QR을 그릴 수 없으므로 조회 실패로 본다.
const MISSING_QR_TOKEN_ERROR: NormalizedApiError = {
  code: 'QR_TOKEN_MISSING',
  message: 'QR 코드를 받지 못했어요.',
};

async function fetchMyFriendCode(): Promise<MyFriendCode> {
  const data = await getMyFriendCode();

  if (!getValidQrToken(data?.qrToken)) {
    throw MISSING_QR_TOKEN_ERROR;
  }

  return data;
}

// QR 토큰은 짧게 유효하고 요청할 때마다 새로 발급될 수 있어서, 캐시를 다시
// 쓰지 않고 모달을 열 때마다 새로 받는다. 창 포커스·재연결로 저절로 다시
// 받으면 보고 있던 QR이 바뀌므로 끈다. 새로 받는 건 refetch뿐이다.
export function useMyFriendCode() {
  const userId = useAuthStore((state) => state.userId);

  const query = useQuery<MyFriendCode, Error>({
    queryKey: getMyFriendCodeQueryKey(userId),
    queryFn: fetchMyFriendCode,
    enabled: userId !== null,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: shouldRetryFriendsQuery,
  });

  return {
    data: query.data,
    // 응답을 받은 시각. 만료 시각 계산의 기준이다.
    receivedAt: query.dataUpdatedAt,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
