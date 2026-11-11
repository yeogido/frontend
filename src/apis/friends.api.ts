import { apiClient, normalizeApiError } from './common';

import type {
  AcceptFriendRequestResult,
  GetFriendRequestsParams,
  GetFriendsParams,
  GetFriendsResponse,
  GetReceivedFriendRequestsResponse,
  GetSentFriendRequestsResponse,
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

export async function getReceivedFriendRequests(
  params: GetFriendRequestsParams = {}
): Promise<GetReceivedFriendRequestsResponse> {
  try {
    const { data } = await apiClient.get<GetReceivedFriendRequestsResponse>(
      '/friends/requests/received',
      { params }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getSentFriendRequests(
  params: GetFriendRequestsParams = {}
): Promise<GetSentFriendRequestsResponse> {
  try {
    const { data } = await apiClient.get<GetSentFriendRequestsResponse>(
      '/friends/requests/sent',
      { params }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function acceptFriendRequest(
  requestId: number
): Promise<AcceptFriendRequestResult> {
  try {
    const { data } = await apiClient.patch<AcceptFriendRequestResult>(
      `/friends/requests/${requestId}/accept`
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// 화면의 "삭제" 버튼. 보낸 사람에게는 알리지 않는다.
export async function rejectFriendRequest(requestId: number): Promise<void> {
  try {
    await apiClient.patch(`/friends/requests/${requestId}/reject`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function cancelFriendRequest(requestId: number): Promise<void> {
  try {
    await apiClient.delete(`/friends/requests/${requestId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
