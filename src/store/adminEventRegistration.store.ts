import { create } from 'zustand';

import type {
  AdminEventBasicInfo,
  AdminEventPhoto,
  EventCategoryId,
} from '../pages/admin/event-registration/types';
import { createEmptyAdminEventBasicInfo } from '../pages/admin/event-registration/types';
import type { PlaceItem } from '../pages/local-recommendation/place-selection/types';
import type { TagId } from '../types/tag.type';

interface AdminEventRegistrationState {
  place: PlaceItem | null;
  basicInfo: AdminEventBasicInfo;
  photo: AdminEventPhoto | null;
  keywordTagIds: TagId[];
  category: EventCategoryId | null;
  setPlace: (place: PlaceItem | null) => void;
  setBasicInfo: (basicInfo: AdminEventBasicInfo) => void;
  setPhoto: (photo: AdminEventPhoto | null) => void;
  setKeywordTagIds: (tagIds: TagId[]) => void;
  setCategory: (category: EventCategoryId | null) => void;
  reset: () => void;
}

export const useAdminEventRegistrationStore =
  create<AdminEventRegistrationState>()((set, get) => ({
    place: null,
    basicInfo: createEmptyAdminEventBasicInfo(),
    photo: null,
    keywordTagIds: [],
    category: null,
    setPlace: (place) => set({ place }),
    setBasicInfo: (basicInfo) => set({ basicInfo }),
    setPhoto: (photo) => {
      const previousPhoto = get().photo;
      if (previousPhoto && previousPhoto.previewUrl !== photo?.previewUrl) {
        URL.revokeObjectURL(previousPhoto.previewUrl);
      }
      set({ photo });
    },
    setKeywordTagIds: (keywordTagIds) => set({ keywordTagIds }),
    setCategory: (category) => set({ category }),
    reset: () => {
      const previousPhoto = get().photo;
      if (previousPhoto) URL.revokeObjectURL(previousPhoto.previewUrl);
      set({
        place: null,
        basicInfo: createEmptyAdminEventBasicInfo(),
        photo: null,
        keywordTagIds: [],
        category: null,
      });
    },
  }));
