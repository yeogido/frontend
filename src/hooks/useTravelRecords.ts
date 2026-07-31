import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';

import { createPresignedUrl, uploadFileToPresignedUrl } from '../apis/files.api';
import {
  createTravelRecord,
  getTravelRecordDetail,
  getTravelRecords,
  getTravelRecordYears,
} from '../apis/travelRecords.api';
import type { TravelRecordFolder } from '../pages/travel-record/types';
import {
  createTravelRecordCreateRequest,
  mapTravelRecordDetailToFolder,
  mapTravelRecordFolder,
  mapTravelRecordSummaryToFolder,
} from '../pages/travel-record/mappers/travelRecordApiMapper';
import type { TravelDateRange } from '../pages/travel-record/date-selection/types';
import type { TravelFolderDecoration } from '../pages/travel-record/folder-decoration/folderDecoration';
import type { TravelRecordDraftRegion } from '../pages/travel-record/types';
import type {
  TravelRecordCreateResponse,
  TravelRecordDetailResponse,
  TravelRecordListParams,
  TravelRecordListResponse,
  TravelRecordSummary,
  UploadedTravelRecordImage,
} from '../types/travelRecord.type';

interface TravelRecordsPageParam {
  cursor?: number;
}

interface CreateTravelRecordFromDraftParams {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: File[];
  decorations: TravelFolderDecoration[];
}

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
  return useQuery({
    queryKey: ['travelRecord', travelRecordId],
    queryFn: async (): Promise<TravelRecordFolder> =>
      mapTravelRecordDetailToFolder(
        await getTravelRecordDetail(travelRecordId as number),
      ),
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
      const uploadedImages: UploadedTravelRecordImage[] = [];

      for (const photo of selectedPhotos) {
        const presignedUrl = await createPresignedUrl({
          fileName: photo.name,
          contentType: photo.type || 'application/octet-stream',
        });
        await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo);
        uploadedImages.push({ objectKey: presignedUrl.objectKey });
      }

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

export const getTravelRecordFoldersFromPages = (
  pages: TravelRecordListResponse[] | undefined,
) =>
  pages?.flatMap((page) =>
    page.items.map((record) => mapTravelRecordSummaryToFolder(record)),
  ) ?? [];

export const getTravelRecordSummariesFromPages = (
  pages: TravelRecordListResponse[] | undefined,
) => pages?.flatMap((page) => page.items) ?? [];

export const getTravelRecordFolders = (
  records: TravelRecordSummary[],
  details: Array<TravelRecordDetailResponse | undefined>,
) =>
  records.map((record, index) => mapTravelRecordFolder(record, details[index]));
