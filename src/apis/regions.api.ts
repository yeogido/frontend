import {
  apiClient,
  normalizeApiError,
  type ApiResponse,
} from './common';

import type { GetRegionsResponse } from '../types/region.type';

export async function getRegions(): Promise<GetRegionsResponse> {
  try {
    const { data } = await apiClient.get<ApiResponse<GetRegionsResponse>>(
      '/regions'
    );

    if (!data.isSuccess) {
      throw data;
    }

    return data.result;
  } catch (error) {
    throw normalizeApiError(error);
  }
}