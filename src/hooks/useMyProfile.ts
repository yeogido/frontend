import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteMyAccount, getMyProfile, updateMyProfile } from '../apis/users.api';
import type {
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '../types/user.type';
import { useAuth } from './useAuth';

export const MY_PROFILE_QUERY_KEY = ['myProfile'];

export function useMyProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation<UpdateMyProfileResponse, Error, UpdateMyProfileRequest>({
    mutationFn: (payload) => updateMyProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY });
    },
  });
}

export function useDeleteMyAccount() {
  return useMutation({
    mutationFn: deleteMyAccount,
  });
}
