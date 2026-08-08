import { create } from 'zustand';

import type { CourseBasicInfoValues } from '../pages/local-recommendation/course-basic-info/schema';
import type { FestivalItem } from '../pages/local-recommendation/event-selection/types';
import type { Neighborhood } from '../pages/local-recommendation/region-selection/types';
import type { VisitEvent } from '../pages/local-recommendation/visit-order-selection/constants';
import {
  VISIT_EVENT_CONTENT_ID_PREFIX,
  VISIT_EVENT_PLACE_ID_PREFIX,
  type AdminCoursePhoto,
  type AdminCoursePlaceItem,
} from '../pages/admin/course-registration/types';
import type { TagId } from '../types/tag.type';

interface AdminCourseRegistrationState {
  region: Neighborhood | null;
  basicInfo: CourseBasicInfoValues | null;
  photo: AdminCoursePhoto | null;
  keywordTagIds: TagId[];
  selectedEvents: FestivalItem[];
  selectedPlaces: AdminCoursePlaceItem[];
  visitOrder: VisitEvent[];
  /** null이면 새로 등록, 값이 있으면 해당 코스를 수정하는 흐름이다. */
  editingCourseId: number | null;
  /**
   * 수정 진입 시 상세 조회의 thumbnailUrl에서 유추한 기존 대표 사진 key.
   * photo(새로 고른 파일)가 없으면 제출 시 이 값을 그대로 재사용해 대표
   * 사진을 매번 다시 올리지 않아도 되게 한다.
   */
  existingThumbnailKey: string | null;
  setRegion: (region: Neighborhood | null) => void;
  setBasicInfo: (basicInfo: CourseBasicInfoValues) => void;
  setPhoto: (photo: AdminCoursePhoto | null) => void;
  setKeywordTagIds: (tagIds: TagId[]) => void;
  setSelectedEvents: (events: FestivalItem[]) => void;
  setSelectedPlaces: (places: AdminCoursePlaceItem[]) => void;
  setVisitOrder: (visitOrder: VisitEvent[]) => void;
  setEditingCourseId: (courseId: number | null) => void;
  setExistingThumbnailKey: (key: string | null) => void;
  reset: () => void;
}

// selectedPlaces는 통째로 교체되는 배열이라, 이전 배열에는 있었지만 다음
// 배열에는 없는(삭제된) 항목의 사진 blob URL만 골라 해제한다.
const revokeRemovedPlacePhotos = (
  previous: AdminCoursePlaceItem[],
  next: AdminCoursePlaceItem[]
) => {
  const nextIds = new Set(next.map((place) => place.id));
  previous.forEach((place) => {
    if (!nextIds.has(place.id) && place.photoPreviewUrl) {
      URL.revokeObjectURL(place.photoPreviewUrl);
    }
  });
};

export const useAdminCourseRegistrationStore =
  create<AdminCourseRegistrationState>()((set, get) => ({
    region: null,
    basicInfo: null,
    photo: null,
    keywordTagIds: [],
    selectedEvents: [],
    selectedPlaces: [],
    visitOrder: [],
    editingCourseId: null,
    existingThumbnailKey: null,
    setRegion: (region) => set({ region }),
    setBasicInfo: (basicInfo) => set({ basicInfo }),
    setPhoto: (photo) => {
      const previousPhoto = get().photo;
      if (previousPhoto && previousPhoto.previewUrl !== photo?.previewUrl) {
        URL.revokeObjectURL(previousPhoto.previewUrl);
      }
      set({ photo });
    },
    setKeywordTagIds: (keywordTagIds) => set({ keywordTagIds }),
    setSelectedEvents: (selectedEvents) => {
      // 방문 순서에 이미 반영된 행사가 빠지면(뒤로 가서 삭제) visitOrder에도
      // 유령 항목으로 남지 않도록 같이 정리한다.
      const contentIds = new Set(
        selectedEvents.map((event) => `${VISIT_EVENT_CONTENT_ID_PREFIX}${event.id}`)
      );
      set((state) => ({
        selectedEvents,
        visitOrder: state.visitOrder.filter(
          (event) => event.kind !== 'CONTENT' || contentIds.has(event.id)
        ),
      }));
    },
    setSelectedPlaces: (selectedPlaces) => {
      revokeRemovedPlacePhotos(get().selectedPlaces, selectedPlaces);
      const placeIds = new Set(
        selectedPlaces.map((place) => `${VISIT_EVENT_PLACE_ID_PREFIX}${place.id}`)
      );
      set((state) => ({
        selectedPlaces,
        visitOrder: state.visitOrder.filter(
          (event) => event.kind !== 'PLACE' || placeIds.has(event.id)
        ),
      }));
    },
    setVisitOrder: (visitOrder) => set({ visitOrder }),
    setEditingCourseId: (editingCourseId) => set({ editingCourseId }),
    setExistingThumbnailKey: (existingThumbnailKey) =>
      set({ existingThumbnailKey }),
    reset: () => {
      const { photo, selectedPlaces } = get();
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      selectedPlaces.forEach((place) => {
        if (place.photoPreviewUrl) URL.revokeObjectURL(place.photoPreviewUrl);
      });
      set({
        region: null,
        basicInfo: null,
        photo: null,
        keywordTagIds: [],
        selectedEvents: [],
        selectedPlaces: [],
        visitOrder: [],
        editingCourseId: null,
        existingThumbnailKey: null,
      });
    },
  }));
