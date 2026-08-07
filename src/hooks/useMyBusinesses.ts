import { useQuery } from '@tanstack/react-query';

import { getMyBusinesses } from '../apis/users.api';
import { useAuthStore } from '../store/auth.store';

// 로그아웃은 auth store만 비우고 쿼리 캐시는 남긴다. key가 계정과 무관하면
// 다른 계정으로 로그인했을 때 재조회가 끝나기 전까지 이전 계정의 사업장이
// 그대로 보인다. userId를 key에 넣어 계정별로 분리한다.
export const MY_BUSINESSES_QUERY_PREFIX = ['myBusinesses'];

export const getMyBusinessesQueryKey = (userId: number | null) => [
  ...MY_BUSINESSES_QUERY_PREFIX,
  userId,
];

export function useMyBusinesses(enabled = true) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: getMyBusinessesQueryKey(userId),
    queryFn: getMyBusinesses,
    enabled: enabled && userId !== null,
  });
}
