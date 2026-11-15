import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FORM_DURATION_TO_DURATION_TYPE } from '../pages/local-recommendation/course-basic-info/constants/options.ts';
import type { CourseBasicInfoValues } from '../pages/local-recommendation/course-basic-info/schema';
import type { FestivalItem } from '../pages/local-recommendation/event-selection/types';
import type { Neighborhood } from '../pages/local-recommendation/region-selection/types';
import {
  getDurationTypeForTotalDays,
  getTotalDaysForDuration,
  padVisitOrderToDays,
} from '../utils/courseDetail.ts';
import { DURATION_TYPE_TO_FORM_DURATION } from '../pages/local-recommendation/course-basic-info/constants/options.ts';
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

/**
 * 수정 흐름에서 실제로 손댄 영역. PATCH는 전달한 필드만 바꾸고 hashtagIds와
 * courseItems는 전달 시 전체 교체라, 건드리지 않은 영역은 보내지 않는 쪽이
 * 안전하다(서버가 들고 있는 이동 시간·영업시간을 그대로 둘 수 있다).
 * 신규 등록에서는 쓰이지 않는다 — 생성 요청은 항상 모든 필드를 보낸다.
 */
export interface CourseDirtyFields {
  /** 제목·설명·기간·이동수단·동행·방문 시기 */
  basicInfo: boolean;
  /** 대표 사진과 키워드(해시태그) */
  tags: boolean;
  /** 일차 구성과 방문 순서 */
  courseItems: boolean;
}

export const NO_DIRTY_FIELDS: CourseDirtyFields = {
  basicInfo: false,
  tags: false,
  courseItems: false,
};

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
  /** 수정 흐름에서 PATCH에 담을 영역을 고르는 데 쓴다(CourseDirtyFields 참고). */
  dirtyFields: CourseDirtyFields;
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
  /** 일차를 늘리거나 줄일 때 쓴다. 기간(basicInfo.duration)도 함께 맞춘다. */
  setTotalDays: (totalDays: number) => void;
  /** 수정 화면에서 일정 하나를 코스에서 뺀다(장소/행사 목록에서도 지운다). */
  removeVisitEvent: (id: string) => void;
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
    dirtyFields: { ...NO_DIRTY_FIELDS },
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
              dirtyFields: {
                ...state.draft.dirtyFields,
                basicInfo: true,
                // 일수가 달라지면 서버는 courseItems 전체를 함께 요구한다.
                courseItems:
                  state.draft.dirtyFields.courseItems ||
                  totalDays !== state.draft.totalDays,
              },
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
            dirtyFields: { ...state.draft.dirtyFields, tags: true },
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
            dirtyFields: { ...state.draft.dirtyFields, courseItems: true },
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
            dirtyFields: { ...state.draft.dirtyFields, courseItems: true },
          },
        })),
      setVisitOrder: (visitOrder) =>
        set((state) => ({
          draft: {
            ...state.draft,
            visitOrder: visitOrder.map((dayOrder) => [...dayOrder]),
            dirtyFields: { ...state.draft.dirtyFields, courseItems: true },
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

          return {
            draft: {
              ...state.draft,
              visitOrder,
              dirtyFields: { ...state.draft.dirtyFields, courseItems: true },
            },
          };
        }),
      setTotalDays: (totalDays) =>
        set((state) => {
          const nextTotalDays = Math.max(totalDays, 1);
          // 기간과 일수가 어긋나면 서버가 거절한다(COMMON4001). 일차를
          // 늘리거나 줄이면 기간 선택도 그 일수에 맞는 값으로 따라간다.
          const duration =
            DURATION_TYPE_TO_FORM_DURATION[
              getDurationTypeForTotalDays(nextTotalDays)
            ];
          const { basicInfo } = state.draft;

          return {
            draft: {
              ...state.draft,
              basicInfo: basicInfo ? { ...basicInfo, duration } : basicInfo,
              totalDays: nextTotalDays,
              visitOrder: padVisitOrderToDays(
                state.draft.visitOrder,
                nextTotalDays
              ),
              dirtyFields: {
                ...state.draft.dirtyFields,
                courseItems: true,
                basicInfo:
                  state.draft.dirtyFields.basicInfo ||
                  basicInfo?.duration !== duration,
              },
            },
          };
        }),
      removeVisitEvent: (id) =>
        set((state) => {
          const { places, festivals, visitOrder } = state.draft;
          if (
            !places.some((place) => place.id === id) &&
            !festivals.some((festival) => festival.id === id)
          ) {
            return state;
          }

          return {
            draft: {
              ...state.draft,
              places: places.filter((place) => place.id !== id),
              festivals: festivals.filter((festival) => festival.id !== id),
              visitOrder: visitOrder.map((dayOrder) =>
                dayOrder.filter((eventId) => eventId !== id)
              ),
              dirtyFields: { ...state.draft.dirtyFields, courseItems: true },
            },
          };
        }),
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
            dirtyFields: { ...state.draft.dirtyFields, tags: true },
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
      // v2: visitOrder가 평평한 배열에서 일차별 배열로 바뀌었다.
      // v3: draft에 dirtyFields가 생겼다. 둘 다 작성 중이던 임시 draft라
      // 변환하지 않고 비운다.
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 3) {
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
