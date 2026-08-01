import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CourseBasicInfoValues } from '../pages/local-recommendation/course-basic-info/schema';
import type { FestivalItem } from '../pages/local-recommendation/event-selection/types';
import type { Neighborhood } from '../pages/local-recommendation/region-selection/types';

export interface PersistedSelectedPlace {
  id: string;
  title: string;
  address: string;
  imageKey: string;
  externalPlaceId: string;
  categoryGroupCode: string;
  roadAddress: string;
  lotAddress: string;
  latitude: number;
  longitude: number;
}

interface PersistedSelectedFestival {
  id: string;
  contentId: number;
  tag: string;
  title: string;
  address: string;
}

type PersistedSelectedPlaceInput = PersistedSelectedPlace & {
  imageSrc?: string | null;
};

export interface LocalRecommendationDraft {
  neighborhood: Neighborhood | null;
  basicInfo: CourseBasicInfoValues | null;
  tagIds: string[];
  hashtagIds: number[];
  coverImageKey: string | null;
  festivals: PersistedSelectedFestival[];
  places: PersistedSelectedPlace[];
  visitOrder: string[];
}

export interface LocalRecommendationState {
  draft: LocalRecommendationDraft;
  setNeighborhood: (neighborhood: Neighborhood | null) => void;
  updateBasicInfo: (basicInfo: CourseBasicInfoValues) => void;
  setTagSelection: (selection: {
    tagIds: readonly string[];
    hashtagIds: readonly number[];
    coverImageKey: string | null;
  }) => void;
  setFestivals: (festivals: readonly FestivalItem[]) => void;
  setPlaces: (places: readonly PersistedSelectedPlaceInput[]) => void;
  setVisitOrder: (visitOrder: readonly string[]) => void;
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
  });

export const useLocalRecommendationStore = create<LocalRecommendationState>()(
  persist(
    (set) => ({
      draft: createEmptyLocalRecommendationDraft(),
      setNeighborhood: (neighborhood) =>
        set((state) => ({
          draft: {
            ...state.draft,
            neighborhood: neighborhood ? { ...neighborhood } : null,
          },
        })),
      updateBasicInfo: (basicInfo) =>
        set((state) => ({
          draft: { ...state.draft, basicInfo: { ...basicInfo } },
        })),
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
            festivals: festivals.map(
              ({ id, contentId, tag, title, address }) => ({
                id,
                contentId,
                tag,
                title,
                address,
              })
            ),
          },
        })),
      setPlaces: (places) =>
        set((state) => ({
          draft: {
            ...state.draft,
            places: places.map(
              ({
                id,
                title,
                address,
                imageKey,
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
          draft: { ...state.draft, visitOrder: [...visitOrder] },
        })),
      resetDraft: () => set({ draft: createEmptyLocalRecommendationDraft() }),
    }),
    {
      name: 'local-recommendation-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draft: state.draft }),
    }
  )
);
