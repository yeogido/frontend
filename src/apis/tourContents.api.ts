import { apiClient, normalizeApiError } from './common';

import type { TourContentSyncResult } from '../types/content.type';

/** 한국관광공사 문화콘텐츠 데이터를 즉시 동기화한다. 신규 콘텐츠는 PENDING 상태로 저장된다. */
export async function syncTourContents(): Promise<TourContentSyncResult> {
  try {
    const { data } = await apiClient.post<TourContentSyncResult>(
      '/tour-contents/sync'
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
