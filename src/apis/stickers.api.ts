import { apiClient, normalizeApiError } from './common';

import type {
  CustomStickerCreateRequest,
  CustomStickerCreateResponse,
  StickerListResponse,
} from '../types/sticker.type';

export async function getStickers(): Promise<StickerListResponse> {
  try {
    const { data } = await apiClient.get<StickerListResponse>('/stickers');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createCustomSticker(
  request: CustomStickerCreateRequest,
): Promise<CustomStickerCreateResponse> {
  try {
    const { data } = await apiClient.post<CustomStickerCreateResponse>(
      '/stickers',
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteCustomSticker(stickerId: number): Promise<void> {
  try {
    await apiClient.delete(`/stickers/${stickerId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
