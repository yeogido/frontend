import { apiClient } from './common';

import type {
  GetRegionsResponse,
  GetSubRegionsResponse,
  RegionSearchResult,
  SubRegion,
} from '../types/region.type';

// apiClient's response interceptor already unwraps the { isSuccess, result }
// envelope and rejects with a NormalizedApiError on failure.
export async function getRegions(): Promise<GetRegionsResponse> {
  const { data } = await apiClient.get<GetRegionsResponse>('/regions');

  return data;
}

export async function getSubRegions(regionId: number): Promise<SubRegion[]> {
  try {
    const { data } = await apiClient.get<GetSubRegionsResponse>(
      `/regions/${regionId}/sub-regions`
    );

    return data.subRegions;
  } catch (error) {
    // The backend 404s (REGION4041) when a region has no sub-regions — that
    // just means this region is a leaf, not a real failure.
    if (
      error &&
      typeof error === 'object' &&
      (error as { status?: number }).status === 404
    ) {
      return [];
    }

    throw error;
  }
}

export async function searchRegions(
  keyword: string
): Promise<RegionSearchResult[]> {
  const { data } = await apiClient.get<RegionSearchResult[]>(
    '/regions/search',
    { params: { keyword } }
  );

  return data;
}
