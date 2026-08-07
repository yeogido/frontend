import { apiClient, normalizeApiError } from './common';

import type {
  GetMyPostsParams,
  GetMyPostsResponse,
  MyProfile,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '../types/user.type';

export async function getMyPosts(
  params: GetMyPostsParams = {},
): Promise<GetMyPostsResponse> {
  try {
    const { data } = await apiClient.get<GetMyPostsResponse>(
      '/users/me/posts',
      { params },
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getMyProfile(): Promise<MyProfile> {
  try {
    const { data } = await apiClient.get<MyProfile>('/users/me');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateMyProfile(
  payload: UpdateMyProfileRequest,
): Promise<UpdateMyProfileResponse> {
  try {
    const { data } = await apiClient.patch<UpdateMyProfileResponse>(
      '/users/me',
      payload,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteMyAccount(): Promise<null> {
  try {
    const { data } = await apiClient.delete<null>('/users/me');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
