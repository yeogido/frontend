import {
  apiClient,
  normalizeApiError,
} from './common';

import type {
  GetRegionsResponse,
  PopularRegionResponse,
  RegionDetailResponse,
  RegionSearchResponse,
  SubRegionListResponse,
} from '../types/region.type';

export async function getRegions(): Promise<GetRegionsResponse> {
  try {
    const { data } = await apiClient.get<GetRegionsResponse>('/regions');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getRegion(
  regionId: number,
): Promise<RegionDetailResponse> {
  try {
    const { data } = await apiClient.get<RegionDetailResponse>(
      `/regions/${regionId}`,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getSubRegions(
  regionId: number,
): Promise<SubRegionListResponse> {
  try {
    const { data } = await apiClient.get<SubRegionListResponse>(
      `/regions/${regionId}/sub-regions`,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function searchRegions(
  keyword: string,
): Promise<RegionSearchResponse[]> {
  try {
    const { data } = await apiClient.get<RegionSearchResponse[]>(
      '/regions/search',
      { params: { keyword } },
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getPopularRegions(): Promise<PopularRegionResponse[]> {
  try {
    const { data } = await apiClient.get<PopularRegionResponse[]>(
      '/regions/popular',
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
