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
    imageKey: '',
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
    imagePreviewUrl: pendingImage?.previewUrl ?? null,
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

    const next = [...selectedPlaces, { ...place, imageFile, imagePreviewUrl }];
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
