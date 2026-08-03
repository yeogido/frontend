import { apiClient } from './common';

import type {
  GetRegionsResponse,
  GetSubRegionsResponse,
  PopularRegionResponse,
  RegionDetailResponse,
  RegionSearchResponse,
  SubRegion,
} from '../types/region.type';

// apiClient's response interceptor already unwraps the { isSuccess, result }
// envelope and rejects with a NormalizedApiError on failure.
export async function getRegions(): Promise<GetRegionsResponse> {
  const { data } = await apiClient.get<GetRegionsResponse>('/regions');

  return data;
}

export async function getRegion(
  regionId: number,
): Promise<RegionDetailResponse> {
  const { data } = await apiClient.get<RegionDetailResponse>(
    `/regions/${regionId}`,
  );

  return data;
}

export async function getSubRegions(regionId: number): Promise<SubRegion[]> {
  try {
    const { data } = await apiClient.get<GetSubRegionsResponse>(
      `/regions/${regionId}/sub-regions`,
    );

    return data.subRegions;
  } catch (error) {
    // A leaf region has no sub-regions; the backend represents that as 404.
    if (
      error &&
      typeof error === 'object' &&
      (error as { status?: number; code?: string }).status === 404 &&
      (error as { status?: number; code?: string }).code === 'REGION4041'
    ) {
      return [];
    }

    throw error;
  }
}

export async function searchRegions(
  keyword: string,
): Promise<RegionSearchResponse[]> {
  const { data } = await apiClient.get<RegionSearchResponse[]>(
    '/regions/search',
    { params: { keyword } },
  );

  return data;
}

export async function getPopularRegions(): Promise<PopularRegionResponse[]> {
  const { data } = await apiClient.get<PopularRegionResponse[]>(
    '/regions/popular',
  );

  return data;
}
