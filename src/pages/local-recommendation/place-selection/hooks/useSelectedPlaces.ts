import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocalRecommendationStore } from '../../../../store/localRecommendation.store';
import type { PlaceItem, SelectedPlace } from '../types';

function toPersistedPlace({
  imageFile: _imageFile,
  imagePreviewUrl: _imagePreviewUrl,
  ...place
}: SelectedPlace) {
  return { ...place, imageKey: '' };
}

export function useSelectedPlaces() {
  const setPlacesInStore = useLocalRecommendationStore(
    (state) => state.setPlaces
  );
  const setPendingImage = useLocalRecommendationStore(
    (state) => state.setPendingImage
  );
  const removePendingImage = useLocalRecommendationStore(
    (state) => state.removePendingImage
  );
  const clearPendingImages = useLocalRecommendationStore(
    (state) => state.clearPendingImages
  );
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);
  const selectedPlacesRef = useRef<SelectedPlace[]>([]);

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
    setPendingImage(place.id, { file: imageFile, previewUrl: imagePreviewUrl });
    setPlacesInStore(next.map(toPersistedPlace));
    setSelectedPlaces(next);
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    const next = selectedPlacesRef.current.filter(
      (item) => item.id !== place.id
    );
    removePendingImage(place.id);
    setPlacesInStore(next.map(toPersistedPlace));
    setSelectedPlaces(next);
  };

  const removeAllSelectedPlaces = () => {
    clearPendingImages();
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
