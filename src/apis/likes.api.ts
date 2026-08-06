import { apiClient, normalizeApiError } from './common';

import type {
  LikedItemCategory,
  LikedItemQueryCategory,
} from '../pages/likes/types';

export interface LikedItemsParams {
  category: LikedItemQueryCategory;
  keyword?: string;
  sort?: 'LATEST' | 'OLDEST';
  cursorCreatedAt?: string;
  cursorId?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
}

/** 서버 쿼리 파라미터 표기. EVENT는 서버에서 CONTENT로 받는다. */
const LIKED_ITEM_QUERY_CATEGORY_PARAM: Record<LikedItemQueryCategory, string> =
  {
    ALL: 'ALL',
    COURSE: 'COURSE',
    EVENT: 'CONTENT',
    PLACE: 'PLACE',
  };

export interface LikedItemResponse {
  id: number;
  category: LikedItemCategory;
  title: string;
  externalPlaceId?: string;
  thumbnailImage: string | null;
  duration: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string;
  distance: number | null;
  hashtags: string[];
  likedAt: string;
}

export interface GetLikedItemsResponse {
  items: LikedItemResponse[];
  cursorValue: string | null;
  cursorId: number | null;
  hasNext: boolean;
}

export async function getLikedItems(
  params: LikedItemsParams,
  signal?: AbortSignal
): Promise<GetLikedItemsResponse> {
  try {
    const { data } = await apiClient.get<GetLikedItemsResponse>(
      '/users/me/likes',
      {
        params: {
          ...params,
          category: LIKED_ITEM_QUERY_CATEGORY_PARAM[params.category],
        },
        signal,
      }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
