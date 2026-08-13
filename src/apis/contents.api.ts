import { apiClient, normalizeApiError } from './common';

import type {
  ContentCreateRequest,
  ContentCreateResult,
  ContentPublishRequest,
  ContentPublishResult,
  CultureContentBanner,
  CultureContentDetail,
  GetCultureContentsParams,
  GetCultureContentsResponse,
} from '../types/content.type';

export async function getCultureContents(
  params: GetCultureContentsParams = {},
  signal?: AbortSignal
): Promise<GetCultureContentsResponse> {
  try {
    const { data } = await apiClient.get<GetCultureContentsResponse>(
      '/contents',
      { params, signal }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getCultureContentDetail(
  contentId: number
): Promise<CultureContentDetail> {
  try {
    const { data } = await apiClient.get<CultureContentDetail>(
      `/contents/${contentId}`
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
    const { data } =
      await apiClient.get<CultureContentBanner[]>('/contents/banner');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createCultureContent(
  payload: ContentCreateRequest
): Promise<ContentCreateResult> {
  try {
    const { data } = await apiClient.post<ContentCreateResult>(
      '/contents',
      payload
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateCultureContent(
  contentId: number,
  payload: ContentCreateRequest
): Promise<ContentCreateResult> {
  try {
    const { data } = await apiClient.patch<ContentCreateResult>(
      `/contents/${contentId}`,
      payload
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

/** 관광공사 동기화로 PENDING 상태인 콘텐츠를 검토·보완 후 게시한다. */
export async function publishContent(
  contentId: number,
  payload: ContentPublishRequest
): Promise<ContentPublishResult> {
  try {
    const { data } = await apiClient.patch<ContentPublishResult>(
      `/contents/${contentId}/publish`,
      payload
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
