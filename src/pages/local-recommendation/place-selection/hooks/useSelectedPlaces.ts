import { useMemo } from 'react';

import {
  type PendingImage,
  type PersistedSelectedPlace,
  useLocalRecommendationStore,
} from '../../../../store/localRecommendation.store';
import type { PlaceItem, SelectedPlace } from '../types';

function toPersistedPlace(place: SelectedPlace) {
  return {
    id: place.id,
    title: place.title,
    address: place.address,
    // 수정 진입 시 알아낸 기존 key/URL은 새로 안 고르면 그대로 들고 간다
    // (예전엔 여기서 무조건 ''로 지워서 재업로드를 강제했다).
    imageKey: place.imageKey,
    imageUrl: place.imageUrl,
    externalPlaceId: place.externalPlaceId,
    categoryGroupCode: place.categoryGroupCode,
    roadAddress: place.roadAddress,
    lotAddress: place.lotAddress,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function toSelectedPlace(
  place: PersistedSelectedPlace,
  pendingImage: PendingImage | undefined
): SelectedPlace {
  return {
    ...place,
    imageSrc: null,
    imageFile: pendingImage?.originalFile ?? null,
    // 새로 고른 파일이 없으면 기존 이미지를 미리보기로 보여준다.
    imagePreviewUrl: pendingImage?.previewUrl ?? place.imageUrl ?? null,
  };
}

/**
 * 일차 하나에 담긴 장소만 다룬다. 장소 자체는 draft.places에 한 벌로 모여
 * 있고, 어느 일차인지는 draft.visitOrder가 들고 있다.
 */
export function useSelectedPlaces(dayIndex: number) {
  const draftPlaces = useLocalRecommendationStore(
    (state) => state.draft.places
  );
  const visitOrder = useLocalRecommendationStore(
    (state) => state.draft.visitOrder
  );
  const pendingImages = useLocalRecommendationStore(
    (state) => state.pendingImages
  );
  const setPlacesInStore = useLocalRecommendationStore(
    (state) => state.setPlaces
  );
  const assignToDay = useLocalRecommendationStore((state) => state.assignToDay);
  const setPendingImage = useLocalRecommendationStore(
    (state) => state.setPendingImage
  );
  const removePendingImage = useLocalRecommendationStore(
    (state) => state.removePendingImage
  );

  const dayPlaceIds = useMemo(
    () => new Set(visitOrder[dayIndex] ?? []),
    [visitOrder, dayIndex]
  );

  const selectedPlaces = useMemo(
    () =>
      draftPlaces
        .filter((place) => dayPlaceIds.has(place.id))
        .map((place) => toSelectedPlace(place, pendingImages[place.id])),
    [draftPlaces, dayPlaceIds, pendingImages]
  );

  // 검색 결과의 "추가됨" 표시는 일차와 무관하다 — 같은 장소를 두 일차에
  // 넣을 수는 없다(장소 목록이 id 한 벌로 관리된다).
  const selectedPlaceIds = useMemo(
    () => new Set(draftPlaces.map((place) => place.id)),
    [draftPlaces]
  );

  const addSelectedPlace = (
    place: PlaceItem,
    imageFile: File | null,
    imagePreviewUrl: string | null
  ) => {
    if (draftPlaces.some((item) => item.id === place.id)) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      return;
    }

    if (imageFile && imagePreviewUrl) {
      setPendingImage(place.id, {
        file: imageFile,
        previewUrl: imagePreviewUrl,
      });
    }
    setPlacesInStore([
      ...draftPlaces,
      toPersistedPlace({
        ...place,
        imageFile,
        imagePreviewUrl,
        imageKey: null,
        imageUrl: null,
      }),
    ]);
    assignToDay(dayIndex, place.id);
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    removePendingImage(place.id);
    setPlacesInStore(draftPlaces.filter((item) => item.id !== place.id));
  };

  /** 이 일차의 장소만 비운다 — 다른 일차는 건드리지 않는다. */
  const removeAllSelectedPlaces = () => {
    selectedPlaces.forEach((place) => removePendingImage(place.id));
    setPlacesInStore(draftPlaces.filter((place) => !dayPlaceIds.has(place.id)));
  };

  return {
    selectedPlaces,
    selectedPlaceIds,
    addSelectedPlace,
    removeSelectedPlace,
    removeAllSelectedPlaces,
  };
}
