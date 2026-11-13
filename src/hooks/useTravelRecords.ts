import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';

import { normalizeApiError } from '../apis/common';
import { useAuthStore } from '../store/auth.store';
import { requireTravelRecordVersion } from '../pages/travel-record/utils/editVersion';
import {
  createPresignedUrl,
  uploadFileToPresignedUrl,
} from '../apis/files.api';
import { getRegion } from '../apis/regions.api';
import {
  createTravelRecord,
  deleteTravelRecordById,
  getTravelRecordDetail,
  getTravelRecords,
  getTravelRecordYears,
  updateTravelRecord,
} from '../apis/travelRecords.api';
import type { TravelRecordFolder } from '../pages/travel-record/types';
import {
  createTravelRecordCreateRequest,
  createTravelRecordUpdateRequest,
  mapTravelRecordDetailToFolder,
  mapTravelRecordFolder,
  mapTravelRecordSummaryToFolder,
} from '../pages/travel-record/mappers/travelRecordApiMapper';
import type { TravelDateRange } from '../pages/travel-record/date-selection/types';
import type { TravelFolderDecoration } from '../pages/travel-record/folder-decoration/folderDecoration';
import type { TravelRecordDraftRegion } from '../pages/travel-record/types';
import { TRAVEL_RECORD_MAP_QUERY_KEY } from '../pages/travel-record/utils/mapAuth';
import type { TravelRecordPhotoDraft } from '../pages/travel-record/utils/travelRecordSave';
import type { RegionDetailResponse } from '../types/region.type';
import type {
  TravelRecordCreateResponse,
  TravelRecordDetailResponse,
  TravelRecordListParams,
  TravelRecordListResponse,
  TravelRecordSummary,
  TravelRecordUpdateResponse,
  UploadedTravelRecordImage,
  TravelRecordApiVisibility,
} from '../types/travelRecord.type';

type TravelRecordRegionInfo = Pick<RegionDetailResponse, 'name' | 'fullName'>;

const TRAVEL_RECORD_NOT_FOUND_CODE = 'TRAVEL_RECORD4041';

const isTravelRecordNotFoundError = (error: unknown) => {
  const { code, status } = normalizeApiError(error);

  return code === TRAVEL_RECORD_NOT_FOUND_CODE || status === 404;
};

interface TravelRecordsPageParam {
  cursor?: number;
}

interface CreateTravelRecordFromDraftParams {
  visibility?: TravelRecordApiVisibility;
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: File[];
  decorations: TravelFolderDecoration[];
}

interface UpdateTravelRecordFromDraftParams {
  travelRecordId: number;
  version: number;
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: TravelRecordPhotoDraft[];
  decorations: TravelFolderDecoration[];
  isStickerStateRestored: boolean;
  originalTitle?: string;
  originalRegionId?: number;
}

const uploadTravelRecordImages = async (selectedPhotos: File[]) => {
  const uploadedImages: UploadedTravelRecordImage[] = [];

  for (const photo of selectedPhotos) {
    const presignedUrl = await createPresignedUrl({
      fileName: photo.name,
      contentType: photo.type || 'application/octet-stream',
    });
    await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo);
    uploadedImages.push({ objectKey: presignedUrl.objectKey });
  }

  return uploadedImages;
};

const uploadTravelRecordDraftImages = async (
  selectedPhotos: TravelRecordPhotoDraft[]
) => {
  const uploadedImages: UploadedTravelRecordImage[] = [];

  for (const photo of selectedPhotos) {
    if (photo.source === 'server') {
      uploadedImages.push({ objectKey: photo.imageKey });
      continue;
    }

    const presignedUrl = await createPresignedUrl({
      fileName: photo.file.name,
      contentType: photo.file.type || 'application/octet-stream',
    });
    await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo.file);
    uploadedImages.push({ objectKey: presignedUrl.objectKey });
  }

  return uploadedImages;
};

export function useTravelRecords(
  params: TravelRecordListParams = {},
  { enabled = true } = {}
) {
  return useInfiniteQuery<
    TravelRecordListResponse,
    Error,
    InfiniteData<TravelRecordListResponse, TravelRecordsPageParam>,
    [string, TravelRecordListParams],
    TravelRecordsPageParam
  >({
    queryKey: ['travelRecords', params],
    queryFn: ({ pageParam }) =>
      getTravelRecords({
        ...params,
        cursor: pageParam.cursor,
      }),
    initialPageParam: {},
    enabled,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId
        ? { cursor: lastPage.cursorId }
        : undefined,
  });
}

export function useTravelRecordYears({ enabled = true } = {}) {
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  return useQuery({
    queryKey: ['travelRecordYears', userId, authGeneration],
    queryFn: getTravelRecordYears,
    enabled: enabled && userId !== null,
  });
}

export function useTravelRecordDetail(travelRecordId: number | null) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);

  return useQuery({
    queryKey: ['travelRecord', travelRecordId, 'folder', userId, authGeneration],
    queryFn: async (): Promise<TravelRecordFolder> => {
      const detail = await getTravelRecordDetail(travelRecordId as number);
      const regionInfo = await queryClient
        .fetchQuery({
          queryKey: ['region', detail.regionId],
          queryFn: () => getRegion(detail.regionId),
          staleTime: Infinity,
        })
        .catch(() => undefined);

      return mapTravelRecordDetailToFolder(detail, regionInfo);
    },
    enabled:
      userId !== null &&
      typeof travelRecordId === 'number' &&
      travelRecordId > 0,
  });
}

export function useTravelRecordDetails(records: TravelRecordSummary[]) {
  return useQueries({
    queries: records.map((record) => ({
      queryKey: ['travelRecord', record.travelRecordId],
      queryFn: () => getTravelRecordDetail(record.travelRecordId),
    })),
  });
}

export function useCreateTravelRecord() {
  const queryClient = useQueryClient();

  return useMutation<
    TravelRecordCreateResponse,
    Error,
    CreateTravelRecordFromDraftParams
  >({
    mutationFn: async ({
      visibility,
      selectedRegion,
      selectedDateRange,
      selectedPhotos,
      decorations,
    }) => {
      const uploadedImages = await uploadTravelRecordImages(selectedPhotos);

      return createTravelRecord(
        createTravelRecordCreateRequest({
          visibility,
          selectedRegion,
          selectedDateRange,
          uploadedImages,
          decorations,
        })
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
      void queryClient.invalidateQueries({ queryKey: TRAVEL_RECORD_MAP_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
    },
  });
}

export function useUpdateTravelRecord() {
  const queryClient = useQueryClient();

  return useMutation<
    TravelRecordUpdateResponse,
    Error,
    UpdateTravelRecordFromDraftParams
  >({
    mutationFn: async ({
      travelRecordId,
      version,
      selectedRegion,
      selectedDateRange,
      selectedPhotos,
      decorations,
      isStickerStateRestored,
      originalTitle,
      originalRegionId,
    }) => {
      // 사진 업로드 전에 검사한다. 오래된 세션에 임의의 버전을 채우지 않는다.
      const editVersion = requireTravelRecordVersion(version);
      return updateTravelRecord(
        travelRecordId,
        createTravelRecordUpdateRequest({
          version: editVersion,
          selectedRegion,
          selectedDateRange,
          uploadedImages: await uploadTravelRecordDraftImages(selectedPhotos),
          decorations,
          isStickerStateRestored,
          originalTitle,
          originalRegionId,
        })
      );
    },
    onSuccess: (_, { travelRecordId }) => {
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
      void queryClient.invalidateQueries({ queryKey: TRAVEL_RECORD_MAP_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
      void queryClient.invalidateQueries({
        queryKey: ['travelRecord', travelRecordId],
      });
    },
  });
}

export function useDeleteTravelRecord() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (travelRecordId) => {
      try {
        await deleteTravelRecordById(travelRecordId);
      } catch (error) {
        // 이미 없는 기록이면 사용자가 원한 상태에 도달한 것이다. 실패로
        // 처리하면 상세 화면에 남아 재시도해도 계속 404가 나서 빠져나갈
        // 방법이 없어진다. 캐시 정리는 onSuccess에서 이어서 수행한다.
        if (!isTravelRecordNotFoundError(error)) {
          throw error;
        }
      }
    },
    onSuccess: (_, travelRecordId) => {
      // Strip the deleted record out of every cached list immediately,
      // instead of relying on invalidateQueries' async refetch. Otherwise
      // there's a window where the list re-renders with the stale (still
      // containing the deleted id) data, and useTravelRecordDetails
      // re-fetches that id's detail, which now 404s on the server.
      queryClient.setQueriesData<
        InfiniteData<TravelRecordListResponse, TravelRecordsPageParam>
      >({ queryKey: ['travelRecords'] }, (data) => {
        if (!data) {
          return data;
        }

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter(
              (item) => item.travelRecordId !== travelRecordId
            ),
          })),
        };
      });
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
      void queryClient.invalidateQueries({ queryKey: TRAVEL_RECORD_MAP_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
      void queryClient.removeQueries({
        queryKey: ['travelRecord', travelRecordId],
      });
    },
  });
}

export const getTravelRecordFoldersFromPages = (
  pages: TravelRecordListResponse[] | undefined,
  regionInfoByRegionId: ReadonlyMap<number, TravelRecordRegionInfo> = new Map()
) =>
  pages?.flatMap((page) =>
    page.items.map((record) =>
      mapTravelRecordSummaryToFolder(
        record,
        regionInfoByRegionId.get(record.regionId)
      )
    )
  ) ?? [];

export const getTravelRecordSummariesFromPages = (
  pages: TravelRecordListResponse[] | undefined
) => pages?.flatMap((page) => page.items) ?? [];

export const getTravelRecordFoldersFromSummaries = (
  records: TravelRecordSummary[],
  regionInfoByRegionId: ReadonlyMap<number, TravelRecordRegionInfo> = new Map()
) =>
  records.map((record) =>
    mapTravelRecordSummaryToFolder(
      record,
      regionInfoByRegionId.get(record.regionId)
    )
  );

export const getTravelRecordFolders = (
  records: TravelRecordSummary[],
  details: Array<TravelRecordDetailResponse | undefined>,
  regionInfoByRegionId: ReadonlyMap<number, TravelRecordRegionInfo> = new Map()
) =>
  records.map((record, index) =>
    mapTravelRecordFolder(
      record,
      details[index],
      regionInfoByRegionId.get(record.regionId)
    )
  );
