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
    // 이 엔드포인트는 GET /regions가 돌려주는 최상위 17개 지역만 받는다.
    // 시·군·구 ID를 넣으면 (그 지역이 GET /regions/{id}로는 조회되더라도)
    // REGION4041 404가 온다. 호출부가 목록을 못 그리고 멈추지 않도록
    // 빈 목록으로 낮춘다.
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
