import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPresignedUrl, uploadFileToPresignedUrl } from '../apis/files.api';
import {
  createCustomSticker,
  deleteCustomSticker,
  getStickers,
} from '../apis/stickers.api';
import {
  CUSTOM_STICKER_CONTENT_TYPE,
  CUSTOM_STICKER_FILE_NAME,
} from '../pages/travel-record/folder-decoration/folderDecoration';
import {
  appendCustomSticker,
  removeCustomSticker,
} from '../pages/travel-record/folder-decoration/stickerCatalog';
import type {
  CustomStickerCreateResponse,
  StickerListResponse,
} from '../types/sticker.type';

const STICKER_CATALOG_QUERY_KEY = ['stickers'];

export function useStickerCatalog() {
  return useQuery({
    queryKey: STICKER_CATALOG_QUERY_KEY,
    queryFn: getStickers,
    // 기본 스티커는 사실상 고정이고, 커스텀 스티커는 등록/삭제 시 직접
    // 갱신하므로 화면을 옮길 때마다 다시 받을 이유가 없다.
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCustomSticker() {
  const queryClient = useQueryClient();

  return useMutation<CustomStickerCreateResponse, Error, File>({
    mutationFn: async (imageFile) => {
      const presignedUrl = await createPresignedUrl({
        fileName: imageFile.name || CUSTOM_STICKER_FILE_NAME,
        contentType: CUSTOM_STICKER_CONTENT_TYPE,
      });
      await uploadFileToPresignedUrl(
        presignedUrl.uploadUrl,
        imageFile,
        CUSTOM_STICKER_CONTENT_TYPE,
      );

      return createCustomSticker({ imageKey: presignedUrl.objectKey });
    },
    onSuccess: (sticker) => {
      // 등록 응답이 스티커 전체를 주므로 목록을 다시 받을 때까지 기다리지
      // 않고 팔레트에 바로 반영한다. 뒤이은 invalidate가 서버 상태와 맞춘다.
      queryClient.setQueryData<StickerListResponse>(
        STICKER_CATALOG_QUERY_KEY,
        (catalog) => (catalog ? appendCustomSticker(catalog, sticker) : catalog),
      );
      void queryClient.invalidateQueries({ queryKey: STICKER_CATALOG_QUERY_KEY });
    },
  });
}

export function useDeleteCustomSticker() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteCustomSticker,
    onSuccess: (_, stickerId) => {
      queryClient.setQueryData<StickerListResponse>(
        STICKER_CATALOG_QUERY_KEY,
        (catalog) => (catalog ? removeCustomSticker(catalog, stickerId) : catalog),
      );
      void queryClient.invalidateQueries({ queryKey: STICKER_CATALOG_QUERY_KEY });
    },
  });
}
