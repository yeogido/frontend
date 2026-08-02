import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocalRecommendationStore } from '../../../../store/localRecommendation.store';
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

export function useSelectedPlaces() {
  const draftPlaces = useLocalRecommendationStore((state) => state.draft.places);
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
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>(() =>
    draftPlaces.flatMap((place) => {
      const pendingImage = pendingImages[place.id];
      if (!pendingImage) return [];

      return [
        {
          ...place,
          imageSrc: null,
          imageFile: pendingImage.originalFile,
          imagePreviewUrl: pendingImage.previewUrl,
        },
      ];
    })
  );
  const selectedPlacesRef = useRef<SelectedPlace[]>(selectedPlaces);

  useEffect(() => {
    selectedPlacesRef.current = selectedPlaces;
  }, [selectedPlaces]);

  const selectedPlaceIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const addSelectedPlace = (
    place: PlaceItem,
    imageFile: File,
    imagePreviewUrl: string
  ) => {
    if (selectedPlacesRef.current.some((item) => item.id === place.id)) {
      URL.revokeObjectURL(imagePreviewUrl);
      return;
    }

    const next = [
      ...selectedPlacesRef.current,
      { ...place, imageFile, imagePreviewUrl },
    ];
    selectedPlacesRef.current = next;
    setPendingImage(place.id, { file: imageFile, previewUrl: imagePreviewUrl });
    setPlacesInStore(next.map(toPersistedPlace));
    setSelectedPlaces(next);
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    const next = selectedPlacesRef.current.filter(
      (item) => item.id !== place.id
    );
    selectedPlacesRef.current = next;
    removePendingImage(place.id);
    setPlacesInStore(next.map(toPersistedPlace));
    setSelectedPlaces(next);
  };

  const removeAllSelectedPlaces = () => {
    selectedPlacesRef.current.forEach((place) => {
      removePendingImage(place.id);
    });
    selectedPlacesRef.current = [];
    setPlacesInStore([]);
    setSelectedPlaces([]);
  };

  return {
    selectedPlaces,
    selectedPlaceIds,
    addSelectedPlace,
    removeSelectedPlace,
    removeAllSelectedPlaces,
  };
}
