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
  /** null이면 새로 등록, 값이 있으면 해당 문화콘텐츠를 수정하는 흐름이다. */
  editingContentId: number | null;
  setPlace: (place: PlaceItem | null) => void;
  setBasicInfo: (basicInfo: AdminEventBasicInfo) => void;
  setPhoto: (photo: AdminEventPhoto | null) => void;
  setKeywordTagIds: (tagIds: TagId[]) => void;
  setCategory: (category: EventCategoryId | null) => void;
  setEditingContentId: (contentId: number | null) => void;
  reset: () => void;
}

export const useAdminEventRegistrationStore =
  create<AdminEventRegistrationState>()((set, get) => ({
    place: null,
    basicInfo: createEmptyAdminEventBasicInfo(),
    photo: null,
    keywordTagIds: [],
    category: null,
    editingContentId: null,
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
    setEditingContentId: (editingContentId) => set({ editingContentId }),
    reset: () => {
      const previousPhoto = get().photo;
      if (previousPhoto) URL.revokeObjectURL(previousPhoto.previewUrl);
      set({
        place: null,
        basicInfo: createEmptyAdminEventBasicInfo(),
        photo: null,
        keywordTagIds: [],
        category: null,
        editingContentId: null,
      });
    },
  }));
