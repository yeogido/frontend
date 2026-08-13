import { create } from 'zustand';

import type {
  AdminEventBasicInfo,
  AdminEventPhoto,
  EventCategoryId,
} from '../pages/admin/event-registration/types';
import { createEmptyAdminEventBasicInfo } from '../pages/admin/event-registration/types';
import type { PlaceItem } from '../pages/local-recommendation/place-selection/types';
import type { ContentPlaceSource } from '../types/content.type';
import type { TagId } from '../types/tag.type';

interface AdminEventRegistrationState {
  place: PlaceItem | null;
  /**
   * place가 실제로 어디서 왔는지. place-selection의 실제 검색은 항상 카카오라
   * 기본값 'KAKAO'다. 수정 진입 시 상세 조회의 place.source(TOUR_API일 수도
   * 있음)로 덮어써 그 값을 그대로 제출에 실어 보낸다.
   */
  placeSource: ContentPlaceSource;
  /**
   * 수정 진입 시 상세 조회로 채워둔 place의 식별 키(`source:externalPlaceId`).
   * 제출 시점의 place가 이 키와 같으면 "admin이 장소를 안 바꿨다"는 뜻이라
   * place 필드 자체를 요청에서 뺀다 — 관광공사 동기화로 이미 존재하는
   * 장소를 그대로 다시 보내면(officialLinks/thumbnailImageKey와 같은 이유로)
   * 서버가 500을 내는 문제가 있었다. 새로 등록하거나 place-selection에서
   * 다른 장소를 고르면 null이 되어 항상 그대로 보낸다.
   */
  originalPlaceKey: string | null;
  basicInfo: AdminEventBasicInfo;
  photo: AdminEventPhoto | null;
  /**
   * 수정 진입 시 상세 조회의 thumbnailImage에서 유추한 기존 대표 사진 key.
   * photo(새로 고른 파일)가 없으면 제출 시 이 값을 그대로 재사용한다.
   */
  existingThumbnailKey: string | null;
  keywordTagIds: TagId[];
  category: EventCategoryId | null;
  /** null이면 새로 등록, 값이 있으면 해당 문화콘텐츠를 수정하는 흐름이다. */
  editingContentId: number | null;
  setPlace: (place: PlaceItem | null) => void;
  setPlaceSource: (source: ContentPlaceSource) => void;
  setOriginalPlaceKey: (key: string | null) => void;
  setBasicInfo: (basicInfo: AdminEventBasicInfo) => void;
  setPhoto: (photo: AdminEventPhoto | null) => void;
  setExistingThumbnailKey: (key: string | null) => void;
  setKeywordTagIds: (tagIds: TagId[]) => void;
  setCategory: (category: EventCategoryId | null) => void;
  setEditingContentId: (contentId: number | null) => void;
  reset: () => void;
}

export const useAdminEventRegistrationStore =
  create<AdminEventRegistrationState>()((set, get) => ({
    place: null,
    placeSource: 'KAKAO',
    originalPlaceKey: null,
    basicInfo: createEmptyAdminEventBasicInfo(),
    photo: null,
    existingThumbnailKey: null,
    keywordTagIds: [],
    category: null,
    editingContentId: null,
    setPlace: (place) => set({ place }),
    setPlaceSource: (placeSource) => set({ placeSource }),
    setOriginalPlaceKey: (originalPlaceKey) => set({ originalPlaceKey }),
    setBasicInfo: (basicInfo) => set({ basicInfo }),
    setPhoto: (photo) => {
      const previousPhoto = get().photo;
      if (previousPhoto && previousPhoto.previewUrl !== photo?.previewUrl) {
        URL.revokeObjectURL(previousPhoto.previewUrl);
      }
      set({ photo });
    },
    setExistingThumbnailKey: (existingThumbnailKey) =>
      set({ existingThumbnailKey }),
    setKeywordTagIds: (keywordTagIds) => set({ keywordTagIds }),
    setCategory: (category) => set({ category }),
    setEditingContentId: (editingContentId) => set({ editingContentId }),
    reset: () => {
      const previousPhoto = get().photo;
      if (previousPhoto) URL.revokeObjectURL(previousPhoto.previewUrl);
      set({
        place: null,
        placeSource: 'KAKAO',
        originalPlaceKey: null,
        basicInfo: createEmptyAdminEventBasicInfo(),
        photo: null,
        existingThumbnailKey: null,
        keywordTagIds: [],
        category: null,
        editingContentId: null,
      });
    },
  }));
