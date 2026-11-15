import { useQuery } from '@tanstack/react-query';

import { getFriendQrPreview } from '../apis/friends.api';
import { useAuthStore } from '../store/auth.store';
import type { FriendQrPreview } from '../types/friend.type';
import { shouldRetryFriendsQuery } from './utils/friendRetry';

// 계정별로 캐시를 분리한다(userId가 인덱스 1). 이유는 useMyBusinesses의 주석 참고.
export const getFriendQrPreviewQueryKey = (
  userId: number | null,
  qrToken: string | null
): [string, number | null, string | null] => [
  'friendQrPreview',
  userId,
  qrToken,
];

/**
 * 스캔한 QR의 주인. 토큰이 없으면 조회하지 않는다. 포커스로 다시 받지 않는다.
 * 만료 뒤에 다시 받으면 보고 있던 정상 화면이 갑자기 오류로 바뀌기 때문이다.
 */
export function useFriendQrPreview(qrToken: string | null) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery<FriendQrPreview, Error>({
    queryKey: getFriendQrPreviewQueryKey(userId, qrToken),
    queryFn: () => getFriendQrPreview(qrToken as string),
    enabled: userId !== null && qrToken !== null,
    refetchOnWindowFocus: false,
    retry: shouldRetryFriendsQuery,
  });
}
