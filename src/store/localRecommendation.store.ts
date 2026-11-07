import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FORM_DURATION_TO_DURATION_TYPE } from '../pages/local-recommendation/course-basic-info/constants/options.ts';
import type { CourseBasicInfoValues } from '../pages/local-recommendation/course-basic-info/schema';
import type { FestivalItem } from '../pages/local-recommendation/event-selection/types';
import type { Neighborhood } from '../pages/local-recommendation/region-selection/types';
import {
  getTotalDaysForDuration,
  padVisitOrderToDays,
} from '../utils/courseDetail.ts';
import { compressImage } from '../utils/imageCompression.ts';

export const LOCAL_RECOMMENDATION_COVER_IMAGE_ID = 'cover-image';

export interface PersistedSelectedPlace {
  id: string;
  title: string;
  address: string;
  imageKey: string | null;
  /** imageKey에 대응하는 URL — 수정 진입 시 새로 안 고른 장소의 미리보기로 쓴다. */
  imageUrl: string | null;
  externalPlaceId: string;
  categoryGroupCode: string;
  roadAddress: string;
  lotAddress: string;
  latitude: number;
  longitude: number;
}

export interface PersistedSelectedFestival {
  id: string;
  contentId: number;
  tag: string;
  title: string;
  address: string;
  imageSrc: string | null;
}

type PersistedSelectedPlaceInput = PersistedSelectedPlace;

export interface LocalRecommendationDraft {
  neighborhood: Neighborhood | null;
  basicInfo: CourseBasicInfoValues | null;
  tagIds: string[];
  hashtagIds: number[];
  coverImageKey: string | null;
  festivals: PersistedSelectedFestival[];
  places: PersistedSelectedPlace[];
  /** 일차별 방문 순서 — 인덱스 0이 1일차다. 비어 있는 일차도 자리를 지킨다. */
  visitOrder: string[][];
  /** 실제 여행 일수. basicInfo.duration과 일치해야 한다. */
  totalDays: number;
  /** 내가 쓴 우리동네 코스 상세에서 "수정"으로 들어온 경우의 코스 ID. null이면 신규 등록. */
  editingCourseId: number | null;
  /** coverImageKey에 대응하는 URL — 수정 진입 시 대표 사진 미리보기로 쓴다. */
  existingThumbnailUrl: string | null;
}

export interface PendingImage {
  originalFile: File;
  compressedFile: File | null;
  previewUrl: string;
  isCompressing: boolean;
  compressionPromise: Promise<File>;
}

export interface LocalRecommendationState {
  draft: LocalRecommendationDraft;
  pendingImages: Record<string, PendingImage>;
  hasPendingImages: boolean;
  imageRecoveryRequired: boolean;
  setNeighborhood: (neighborhood: Neighborhood | null) => void;
  updateBasicInfo: (basicInfo: CourseBasicInfoValues) => void;
  setTagSelection: (selection: {
    tagIds: readonly string[];
    hashtagIds: readonly number[];
    coverImageKey: string | null;
  }) => void;
  setFestivals: (festivals: readonly FestivalItem[]) => void;
  setPlaces: (places: readonly PersistedSelectedPlaceInput[]) => void;
  setVisitOrder: (visitOrder: readonly (readonly string[])[]) => void;
  /** 선택 화면에서 고른 항목을 해당 일차의 끝에 붙인다(이미 배치됐으면 무시). */
  assignToDay: (dayIndex: number, id: string) => void;
  /** 3박 이상에서 일차를 늘리거나 줄일 때 쓴다. */
  setTotalDays: (totalDays: number) => void;
  /** 수정 진입 시 상세 조회 결과로 draft 전체를 채운다. */
  loadCourseForEditing: (draft: LocalRecommendationDraft) => void;
  /** 수정 중 기존 대표 사진을 삭제했을 때 — 재사용 fallback까지 함께 지운다. */
  clearThumbnail: () => void;
  setPendingImage: (
    placeId: string,
    data: { file: File; previewUrl: string }
  ) => void;
  removePendingImage: (placeId: string) => void;
  clearPendingImages: () => void;
  resetDraft: () => void;
}

export const createEmptyLocalRecommendationDraft =
  (): LocalRecommendationDraft => ({
    neighborhood: null,
    basicInfo: null,
    tagIds: [],
    hashtagIds: [],
    coverImageKey: null,
    festivals: [],
    places: [],
    visitOrder: [],
    totalDays: 1,
    editingCourseId: null,
    existingThumbnailUrl: null,
  });

/** 장소/행사 목록에서 빠진 항목의 id가 방문 순서에 유령으로 남지 않게 한다. */
function pruneVisitOrder(
  visitOrder: readonly (readonly string[])[],
  keepIds: ReadonlySet<string>
): string[][] {
  return visitOrder.map((dayOrder) => dayOrder.filter((id) => keepIds.has(id)));
}

function clearImageDependentDraft(
  draft: LocalRecommendationDraft
): LocalRecommendationDraft {
  return {
    ...draft,
    tagIds: [],
    hashtagIds: [],
    coverImageKey: null,
    existingThumbnailUrl: null,
    places: [],
    visitOrder: [],
  };
}

export const useLocalRecommendationStore = create<LocalRecommendationState>()(
  persist(
    (set) => ({
      draft: createEmptyLocalRecommendationDraft(),
      pendingImages: {},
      hasPendingImages: false,
      imageRecoveryRequired: false,
      setNeighborhood: (neighborhood) =>
        set((state) => ({
          draft: {
            ...state.draft,
            neighborhood: neighborhood ? { ...neighborhood } : null,
          },
        })),
      updateBasicInfo: (basicInfo) =>
        set((state) => {
          // 기간이 바뀌면 여행 일수도 따라간다. 3박 이상은 사용자가 늘려 둔
          // 일수를 그대로 유지한다.
          const totalDays = getTotalDaysForDuration(
            FORM_DURATION_TO_DURATION_TYPE[basicInfo.duration],
            state.draft.totalDays
          );

          return {
            draft: {
              ...state.draft,
              basicInfo: { ...basicInfo },
              totalDays,
              visitOrder: padVisitOrderToDays(
                state.draft.visitOrder,
                totalDays
              ),
            },
          };
        }),
      setTagSelection: ({ tagIds, hashtagIds, coverImageKey }) =>
        set((state) => ({
          draft: {
            ...state.draft,
            tagIds: [...tagIds],
            hashtagIds: [...hashtagIds],
            coverImageKey,
          },
        })),
      setFestivals: (festivals) =>
        set((state) => ({
          draft: {
            ...state.draft,
            visitOrder: pruneVisitOrder(
              state.draft.visitOrder,
              new Set([
                ...festivals.map((festival) => festival.id),
                ...state.draft.places.map((place) => place.id),
              ])
            ),
            festivals: festivals.map(
              ({ id, contentId, tag, title, address, imageSrc }) => ({
                id,
                contentId,
                tag,
                title,
                address,
                imageSrc,
              })
            ),
          },
        })),
      setPlaces: (places) =>
        set((state) => ({
          draft: {
            ...state.draft,
            visitOrder: pruneVisitOrder(
              state.draft.visitOrder,
              new Set([
                ...places.map((place) => place.id),
                ...state.draft.festivals.map((festival) => festival.id),
              ])
            ),
            places: places.map(
              ({
                id,
                title,
                address,
                imageKey,
                imageUrl,
                externalPlaceId,
                categoryGroupCode,
                roadAddress,
                lotAddress,
                latitude,
                longitude,
              }) => ({
                id,
                title,
                address,
                imageKey,
                imageUrl: imageUrl ?? null,
                externalPlaceId,
                categoryGroupCode,
                roadAddress,
                lotAddress,
                latitude,
                longitude,
              })
            ),
          },
        })),
      setVisitOrder: (visitOrder) =>
        set((state) => ({
          draft: {
            ...state.draft,
            visitOrder: visitOrder.map((dayOrder) => [...dayOrder]),
          },
        })),
      assignToDay: (dayIndex, id) =>
        set((state) => {
          const visitOrder = padVisitOrderToDays(
            state.draft.visitOrder,
            state.draft.totalDays
          );
          if (visitOrder.some((dayOrder) => dayOrder.includes(id))) {
            return state;
          }

          const index = Math.min(Math.max(dayIndex, 0), visitOrder.length - 1);
          visitOrder[index] = [...visitOrder[index], id];

          return { draft: { ...state.draft, visitOrder } };
        }),
      setTotalDays: (totalDays) =>
        set((state) => ({
          draft: {
            ...state.draft,
            totalDays,
            visitOrder: padVisitOrderToDays(state.draft.visitOrder, totalDays),
          },
        })),
      loadCourseForEditing: (draft) => {
        Object.values(
          useLocalRecommendationStore.getState().pendingImages
        ).forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
        set({
          draft,
          pendingImages: {},
          hasPendingImages: false,
          imageRecoveryRequired: false,
        });
      },
      clearThumbnail: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            coverImageKey: null,
            existingThumbnailUrl: null,
          },
        })),
      setPendingImage: (placeId, { file, previewUrl }) => {
        const previousImage =
          useLocalRecommendationStore.getState().pendingImages[placeId];
        if (previousImage) URL.revokeObjectURL(previousImage.previewUrl);
        const compressionPromise = compressImage(file).catch(() => file);
        const pendingImage: PendingImage = {
          originalFile: file,
          compressedFile: null,
          previewUrl,
          isCompressing: true,
          compressionPromise,
        };
        set((state) => ({
          pendingImages: { ...state.pendingImages, [placeId]: pendingImage },
          hasPendingImages: true,
          imageRecoveryRequired: false,
        }));
        void compressionPromise.then((compressedFile) => {
          set((state) => {
            const current = state.pendingImages[placeId];
            if (!current || current.compressionPromise !== compressionPromise) {
              return state;
            }
            return {
              pendingImages: {
                ...state.pendingImages,
                [placeId]: {
                  ...current,
                  compressedFile,
                  isCompressing: false,
                },
              },
            };
          });
        });
      },
      removePendingImage: (placeId) =>
        set((state) => {
          const pendingImage = state.pendingImages[placeId];
          if (!pendingImage) return state;
          URL.revokeObjectURL(pendingImage.previewUrl);
          const pendingImages = { ...state.pendingImages };
          delete pendingImages[placeId];
          return {
            pendingImages,
            hasPendingImages: Object.keys(pendingImages).length > 0,
          };
        }),
      clearPendingImages: () =>
        set((state) => {
          Object.values(state.pendingImages).forEach(({ previewUrl }) => {
            URL.revokeObjectURL(previewUrl);
          });
          return {
            pendingImages: {},
            hasPendingImages: false,
            imageRecoveryRequired: false,
          };
        }),
      resetDraft: () =>
        set((state) => {
          Object.values(state.pendingImages).forEach(({ previewUrl }) => {
            URL.revokeObjectURL(previewUrl);
          });
          return {
            draft: createEmptyLocalRecommendationDraft(),
            pendingImages: {},
            hasPendingImages: false,
            imageRecoveryRequired: false,
          };
        }),
    }),
    {
      name: 'local-recommendation-draft',
      storage: createJSONStorage(() => localStorage),
      // v2: visitOrder가 평평한 배열에서 일차별 배열로 바뀌었다. 작성 중이던
      // 임시 draft라 변환하지 않고 비운다.
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return {
            draft: createEmptyLocalRecommendationDraft(),
            hasPendingImages: false,
          };
        }

        return persistedState as LocalRecommendationState;
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<LocalRecommendationState>;
        const hasPendingImages = persisted.hasPendingImages === true;
        const draft = persisted.draft ?? currentState.draft;

        return {
          ...currentState,
          ...persisted,
          draft: hasPendingImages ? clearImageDependentDraft(draft) : draft,
          pendingImages: {},
          imageRecoveryRequired: hasPendingImages,
        };
      },
      partialize: (state) => ({
        draft: state.draft,
        hasPendingImages: state.hasPendingImages,
      }),
    }
  )
);
