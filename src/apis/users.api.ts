import { apiClient, normalizeApiError } from './common';

import type {
  GetMyPostsParams,
  GetMyPostsResponse,
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
