import {
  apiClient,
  normalizeApiError,
  type ApiResponse,
} from './common';

import type {
  GetCultureContentsParams,
  GetCultureContentsResponse,
} from '../types/content.type';

export async function getCultureContents(
  params: GetCultureContentsParams = {},
): Promise<GetCultureContentsResponse> {
  try {
    const { data } = await apiClient.get<
      ApiResponse<GetCultureContentsResponse>
    >('/contents', { params });

    if (!data.isSuccess) {
      throw data;
    }

    return data.result;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
