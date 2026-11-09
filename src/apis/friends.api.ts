import { apiClient, normalizeApiError } from './common';

import type {
  GetFriendsParams,
  GetFriendsResponse,
} from '../types/friend.type';

export async function getFriends(
  params: GetFriendsParams = {}
): Promise<GetFriendsResponse> {
  try {
    const { data } = await apiClient.get<GetFriendsResponse>('/friends', {
      params,
    });

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteFriend(friendUserId: number): Promise<void> {
  try {
    await apiClient.delete(`/friends/${friendUserId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
