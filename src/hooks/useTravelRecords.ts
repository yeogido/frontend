import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';

import { createPresignedUrl, uploadFileToPresignedUrl } from '../apis/files.api';
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
} from '../types/travelRecord.type';

type TravelRecordRegionInfo = Pick<RegionDetailResponse, 'name' | 'fullName'>;

interface TravelRecordsPageParam {
  cursor?: number;
}

interface CreateTravelRecordFromDraftParams {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: File[];
  decorations: TravelFolderDecoration[];
}

interface UpdateTravelRecordFromDraftParams {
  travelRecordId: number;
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: TravelRecordPhotoDraft[];
  decorations: TravelFolderDecoration[];
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
  selectedPhotos: TravelRecordPhotoDraft[],
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

export function useTravelRecords(params: TravelRecordListParams = {}) {
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
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId
        ? { cursor: lastPage.cursorId }
        : undefined,
  });
}

export function useTravelRecordYears() {
  return useQuery({
    queryKey: ['travelRecordYears'],
    queryFn: getTravelRecordYears,
  });
}

export function useTravelRecordDetail(travelRecordId: number | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['travelRecord', travelRecordId, 'folder'],
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
    enabled: typeof travelRecordId === 'number' && travelRecordId > 0,
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
      selectedRegion,
      selectedDateRange,
      selectedPhotos,
      decorations,
    }) => {
      const uploadedImages = await uploadTravelRecordImages(selectedPhotos);

      return createTravelRecord(
        createTravelRecordCreateRequest({
          selectedRegion,
          selectedDateRange,
          uploadedImages,
          decorations,
        }),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
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
      selectedRegion,
      selectedDateRange,
      selectedPhotos,
      decorations,
    }) =>
      updateTravelRecord(
        travelRecordId,
        createTravelRecordUpdateRequest({
          selectedRegion,
          selectedDateRange,
          uploadedImages: await uploadTravelRecordDraftImages(selectedPhotos),
          decorations,
        }),
      ),
    onSuccess: (_, { travelRecordId }) => {
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
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
    mutationFn: deleteTravelRecordById,
    onSuccess: (_, travelRecordId) => {
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
      void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
      void queryClient.removeQueries({
        queryKey: ['travelRecord', travelRecordId],
      });
    },
  });
}

export const getTravelRecordFoldersFromPages = (
  pages: TravelRecordListResponse[] | undefined,
  regionInfoByRegionId: ReadonlyMap<number, TravelRecordRegionInfo> = new Map(),
) =>
  pages?.flatMap((page) =>
    page.items.map((record) =>
      mapTravelRecordSummaryToFolder(
        record,
        regionInfoByRegionId.get(record.regionId),
      ),
    ),
  ) ?? [];

export const getTravelRecordSummariesFromPages = (
  pages: TravelRecordListResponse[] | undefined,
) => pages?.flatMap((page) => page.items) ?? [];

export const getTravelRecordFolders = (
  records: TravelRecordSummary[],
  details: Array<TravelRecordDetailResponse | undefined>,
  regionInfoByRegionId: ReadonlyMap<number, TravelRecordRegionInfo> = new Map(),
) =>
  records.map((record, index) =>
    mapTravelRecordFolder(
      record,
      details[index],
      regionInfoByRegionId.get(record.regionId),
    ),
  );
