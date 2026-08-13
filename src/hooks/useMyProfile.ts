import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteMyAccount,
  getMyProfile,
  updateMyProfile,
} from '../apis/users.api';
import { useAuthStore } from '../store/auth.store';
import { isAdminRole, isBusinessRole } from '../utils/role';
import type {
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '../types/user.type';

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const MY_PROFILE_QUERY_PREFIX = ['myProfile'];

// role 변경은 updateMyProfile의 invalidateQueries가 이미 처리하므로, 이 값은
// "아무 변경 없이 페이지만 이동/재포커스했을 때" 불필요한 재호출만 막는다.
const MY_PROFILE_STALE_TIME = 1000 * 60;

export const getMyProfileQueryKey = (userId: number | null) => [
  ...MY_PROFILE_QUERY_PREFIX,
  userId,
];

export function useMyProfile() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: getMyProfileQueryKey(userId),
    queryFn: getMyProfile,
    enabled: userId !== null,
    staleTime: MY_PROFILE_STALE_TIME,
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

/**
 * 관리자 전용 화면·버튼을 열지 판단한다. useIsBusinessUser와 같은 이유로
 * 서버가 준 값만 보고, 조회 전이거나 실패하면 false로 기운다.
 */
export function useIsAdmin() {
  const { data } = useMyProfile();

  return isAdminRole(data?.role);
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation<UpdateMyProfileResponse, Error, UpdateMyProfileRequest>({
    mutationFn: (payload) => updateMyProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getMyProfileQueryKey(userId),
      });
    },
  });
}

export function useDeleteMyAccount() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      // 탈퇴한 계정의 프로필 값이 캐시에 남아있으면, 이후 같은 userId가
      // 재사용되는 예외적인 경우에도 잠깐 노출될 수 있다.
      queryClient.removeQueries({ queryKey: getMyProfileQueryKey(userId) });
    },
  });
}
