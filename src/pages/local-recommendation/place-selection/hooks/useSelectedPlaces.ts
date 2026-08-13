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

export function useSelectedPlaces() {
  const draftPlaces = useLocalRecommendationStore(
    (state) => state.draft.places
  );
  const pendingImages = useLocalRecommendationStore(
    (state) => state.pendingImages
  );
  const setPlacesInStore = useLocalRecommendationStore(
    (state) => state.setPlaces
  );
  const setPendingImage = useLocalRecommendationStore(
    (state) => state.setPendingImage
  );
  const removePendingImage = useLocalRecommendationStore(
    (state) => state.removePendingImage
  );
  const selectedPlaces = useMemo(
    () =>
      draftPlaces.map((place) =>
        toSelectedPlace(place, pendingImages[place.id])
      ),
    [draftPlaces, pendingImages]
  );

  const selectedPlaceIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const addSelectedPlace = (
    place: PlaceItem,
    imageFile: File | null,
    imagePreviewUrl: string | null
  ) => {
    if (selectedPlaces.some((item) => item.id === place.id)) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      return;
    }

    const next = [
      ...selectedPlaces,
      { ...place, imageFile, imagePreviewUrl, imageKey: null, imageUrl: null },
    ];
    if (imageFile && imagePreviewUrl) {
      setPendingImage(place.id, {
        file: imageFile,
        previewUrl: imagePreviewUrl,
      });
    }
    setPlacesInStore(next.map(toPersistedPlace));
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    const next = selectedPlaces.filter((item) => item.id !== place.id);
    removePendingImage(place.id);
    setPlacesInStore(next.map(toPersistedPlace));
  };

  const removeAllSelectedPlaces = () => {
    selectedPlaces.forEach((place) => {
      removePendingImage(place.id);
    });
    setPlacesInStore([]);
  };

  return {
    selectedPlaces,
    selectedPlaceIds,
    addSelectedPlace,
    removeSelectedPlace,
    removeAllSelectedPlaces,
  };
}
