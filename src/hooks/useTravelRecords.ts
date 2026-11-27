import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';

import { normalizeApiError, getApiErrorMessage } from '../apis/common';
import { useUpdateTravelRecordVisibility } from './useUpdateTravelRecordVisibility';
import { useTravelRecordSessionStore } from '../store/travelRecordSession.store';
import { useAuthStore } from '../store/auth.store';
import { requireTravelRecordVersion } from '../pages/travel-record/utils/editVersion';
import { canChangeTravelRecordVisibility } from '../pages/travel-record/utils/visibilityPermission';
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

export class TravelRecordPartialSaveError extends Error {}

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
  visibility?: TravelRecordApiVisibility;
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

const uploadTravelRecordImages = async (
  selectedPhotos: File[],
  requireCurrentSession: () => void
) => {
  const uploadedImages: UploadedTravelRecordImage[] = [];

  for (const photo of selectedPhotos) {
    requireCurrentSession();
    const presignedUrl = await createPresignedUrl({
      fileName: photo.name,
      contentType: photo.type || 'application/octet-stream',
    });
    requireCurrentSession();
    await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo);
    requireCurrentSession();
    uploadedImages.push({ objectKey: presignedUrl.objectKey });
  }

  return uploadedImages;
};

const uploadTravelRecordDraftImages = async (
  selectedPhotos: TravelRecordPhotoDraft[],
  requireCurrentSession: () => void
) => {
  const uploadedImages: UploadedTravelRecordImage[] = [];

  for (const photo of selectedPhotos) {
    requireCurrentSession();
    if (photo.source === 'server') {
      uploadedImages.push({ objectKey: photo.imageKey });
      continue;
    }

    const presignedUrl = await createPresignedUrl({
      fileName: photo.file.name,
      contentType: photo.file.type || 'application/octet-stream',
    });
    requireCurrentSession();
    await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo.file);
    requireCurrentSession();
    uploadedImages.push({ objectKey: presignedUrl.objectKey });
  }

  return uploadedImages;
};

export function useTravelRecords(
  params: TravelRecordListParams = {},
  { enabled = true } = {}
) {
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  return useInfiniteQuery<
    TravelRecordListResponse,
    Error,
    InfiniteData<TravelRecordListResponse, TravelRecordsPageParam>,
    [string, number | null, number, TravelRecordListParams],
    TravelRecordsPageParam
  >({
    queryKey: ['travelRecords', userId, authGeneration, params],
    queryFn: ({ pageParam }) =>
      getTravelRecords({
        ...params,
        cursor: pageParam.cursor,
      }),
    initialPageParam: {},
    enabled: enabled && userId !== null,
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
    queryFn: () => getTravelRecordYears(),
    enabled: enabled && userId !== null,
  });
}

export function useTravelRecordDetail(travelRecordId: number | null) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);

  return useQuery({
    queryKey: [
      'travelRecord',
      travelRecordId,
      'folder',
      userId,
      authGeneration,
    ],
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
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  return useQueries({
    queries: records.map((record) => ({
      queryKey: ['travelRecord', record.travelRecordId, userId, authGeneration],
      queryFn: () => getTravelRecordDetail(record.travelRecordId),
      enabled: userId !== null,
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
      const session = useAuthStore.getState();
      const requireCurrentSession = () => {
        const current = useAuthStore.getState();
        if (
          session.userId === null ||
          current.userId !== session.userId ||
          current.authGeneration !== session.authGeneration
        )
          throw new Error('인증 상태가 변경되었습니다.');
      };
      requireCurrentSession();
      const uploadedImages = await uploadTravelRecordImages(
        selectedPhotos,
        requireCurrentSession
      );
      requireCurrentSession();
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
      void queryClient.invalidateQueries({
        queryKey: TRAVEL_RECORD_MAP_QUERY_KEY,
      });
      void queryClient.invalidateQueries({ queryKey: ['travelRecordYears'] });
    },
  });
}

export function useUpdateTravelRecord() {
  const queryClient = useQueryClient();
  const visibilityMutation = useUpdateTravelRecordVisibility();

  return useMutation<
    TravelRecordUpdateResponse,
    Error,
    UpdateTravelRecordFromDraftParams
  >({
    mutationFn: async ({
      travelRecordId,
      version,
      visibility,
      selectedRegion,
      selectedDateRange,
      selectedPhotos,
      decorations,
      isStickerStateRestored,
      originalTitle,
      originalRegionId,
    }) => {
      // 사진 업로드 전에 검사한다. 오래된 세션에 임의의 버전을 채우지 않는다.
      let editVersion = requireTravelRecordVersion(version);
      const session = useAuthStore.getState();
      const original = useTravelRecordSessionStore.getState().editSession;
      const needsVisibilityChange =
        visibility !== undefined && visibility !== original?.visibility;
      if (
        needsVisibilityChange &&
        (original?.id !== String(travelRecordId) ||
          !canChangeTravelRecordVisibility(
            original.ownerId,
            session.userId,
            original.hasOtherParticipants
          ) ||
          original.version !== version ||
          !['PRIVATE', 'FRIENDS', 'PUBLIC'].includes(visibility))
      )
        throw new Error(
          '이 폴더의 공개범위를 변경할 수 없어요. 상세 화면에서 다시 수정해 주세요.'
        );

      // 업로드 실패만으로 공개범위가 먼저 바뀌지 않도록 파일을 준비한다.
      const requireCurrentSession = () => {
        const current = useAuthStore.getState();
        if (
          session.userId === null ||
          current.userId !== session.userId ||
          current.authGeneration !== session.authGeneration
        )
          throw new Error('인증 상태가 변경되었습니다.');
      };
      const uploadedImages = await uploadTravelRecordDraftImages(
        selectedPhotos,
        requireCurrentSession
      );
      requireCurrentSession();
      let visibilitySaved = false;
      try {
        if (needsVisibilityChange && visibility !== undefined) {
          const result = await visibilityMutation.mutateAsync({
            travelRecordId,
            visibility,
            version: editVersion,
          });
          visibilitySaved = true;
          requireCurrentSession();
          editVersion = requireTravelRecordVersion(result.version);
          const store = useTravelRecordSessionStore.getState();
          if (
            store.editSession?.id !== String(travelRecordId) ||
            store.editSession.version !== version
          )
            throw new Error(
              '수정 상태가 변경됐어요. 상세 화면에서 다시 수정해 주세요.'
            );
          // 후속 내용 저장 실패 시에도 서버에 반영된 상태·버전으로 재시도한다.
          store.beginEdit({
            ...store.editSession,
            visibility: result.visibility,
            version: editVersion,
          });
        }
        requireCurrentSession();
        return await updateTravelRecord(
          travelRecordId,
          createTravelRecordUpdateRequest({
            version: editVersion,
            selectedRegion,
            selectedDateRange,
            uploadedImages,
            decorations,
            isStickerStateRestored,
            originalTitle,
            originalRegionId,
          })
        );
      } catch (error) {
        const code = normalizeApiError(error).code;
        if (code === 'TRAVEL_RECORD4091' || code === 'TRAVEL_RECORD4095') {
          void queryClient.invalidateQueries({
            queryKey: ['travelRecord', travelRecordId],
          });
          void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
        }
        if (visibilitySaved)
          throw new TravelRecordPartialSaveError(
            `공개범위는 변경됐지만 기록을 저장하지 못했어요. 다시 저장해 주세요. ${getApiErrorMessage(error, '')}`,
            { cause: error }
          );
        throw error;
      }
    },
    onSuccess: (_, { travelRecordId }) => {
      void queryClient.invalidateQueries({ queryKey: ['travelRecords'] });
      void queryClient.invalidateQueries({
        queryKey: TRAVEL_RECORD_MAP_QUERY_KEY,
      });
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
      void queryClient.invalidateQueries({
        queryKey: TRAVEL_RECORD_MAP_QUERY_KEY,
      });
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
