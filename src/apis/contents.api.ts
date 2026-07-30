import {
  apiClient,
  normalizeApiError,
} from './common';

import type {
  CultureContentBanner,
  CultureContentDetail,
  GetCultureContentsParams,
  GetCultureContentsResponse,
} from '../types/content.type';

export async function getCultureContents(
  params: GetCultureContentsParams = {},
): Promise<GetCultureContentsResponse> {
  try {
    const { data } = await apiClient.get<GetCultureContentsResponse>(
      '/contents',
      { params },
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getCultureContentDetail(
  contentId: number,
): Promise<CultureContentDetail> {
  try {
    const { data } = await apiClient.get<CultureContentDetail>(
      `/contents/${contentId}`,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getCultureContentBanners(): Promise<
  CultureContentBanner[]
> {
  try {
    const { data } = await apiClient.get<CultureContentBanner[]>(
      '/contents/banner',
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
