import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '../apis/users.api';
import { useAuthStore } from '../store/auth.store';
import { isBusinessRole } from '../utils/role';

export const MY_PROFILE_QUERY_KEY = ['myProfile'];

export function useMyProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });
}

/**
 * 소상공인 전용 화면과 버튼을 열지 판단한다.
 *
 * 로그인 응답에는 role이 없고 accessToken에 박힌 role은 인증 직후에도
 * 갱신되지 않으므로, 서버가 준 값만 본다. 조회 전이거나 실패하면 false라
 * 권한이 열리지 않는 쪽으로 기운다.
 */
export function useIsBusinessUser() {
  const { data } = useMyProfile();

  return isBusinessRole(data?.role);
}
