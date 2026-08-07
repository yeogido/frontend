import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteMyAccount, getMyProfile, updateMyProfile } from '../apis/users.api';
import { useAuthStore } from '../store/auth.store';
import { isBusinessRole } from '../utils/role';
import type {
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '../types/user.type';

// 계정별로 캐시를 분리한다. 이유는 useMyBusinesses의 주석 참고.
export const MY_PROFILE_QUERY_PREFIX = ['myProfile'];

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
  return useMutation({
    mutationFn: deleteMyAccount,
  });
}