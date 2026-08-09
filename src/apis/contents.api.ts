import {
  apiClient,
  normalizeApiError,
} from './common';

import type {
  ContentCreateRequest,
  ContentCreateResult,
  CultureContentBanner,
  CultureContentDetail,
  GetCultureContentsParams,
  GetCultureContentsResponse,
  OngoingContent,
} from '../types/content.type';

export async function getOngoingContents(): Promise<OngoingContent[]> {
  try {
    const { data } = await apiClient.get<OngoingContent[]>('/contents/ongoing');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getCultureContents(
  params: GetCultureContentsParams = {},
  signal?: AbortSignal,
): Promise<GetCultureContentsResponse> {
  try {
    const { data } = await apiClient.get<GetCultureContentsResponse>(
      '/contents',
      { params, signal },
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

export async function createCultureContent(
  payload: ContentCreateRequest,
): Promise<ContentCreateResult> {
  try {
    const { data } = await apiClient.post<ContentCreateResult>(
      '/contents',
      payload,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateCultureContent(
  contentId: number,
  payload: ContentCreateRequest,
): Promise<ContentCreateResult> {
  try {
    const { data } = await apiClient.patch<ContentCreateResult>(
      `/contents/${contentId}`,
      payload,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteCultureContent(contentId: number): Promise<void> {
  try {
    await apiClient.delete(`/contents/${contentId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
