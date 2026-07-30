import { useEffect, useMemo, useRef, useState } from 'react';

import { uploadCourseImage } from '../../../../apis/files';
import { useLocalRecommendationStore } from '../../../../store/localRecommendation.store';
import type { PlaceItem, SelectedPlace } from '../types';

export function useSelectedPlaces() {
  // ponytail: store hydration only carries imageKey (File objects aren't
  // JSON-persistable), so revisiting this page can't restore image previews
  // for already-selected places. Upgrade path: persist previews via IndexedDB
  // keyed by imageKey if that gap needs closing.
  const setPlacesInStore = useLocalRecommendationStore(
    (state) => state.setPlaces
  );
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);
  const selectedPlacesRef = useRef<SelectedPlace[]>([]);

  useEffect(() => {
    selectedPlacesRef.current = selectedPlaces;
  }, [selectedPlaces]);

  useEffect(() => {
    return () => {
      selectedPlacesRef.current.forEach((place) => {
        URL.revokeObjectURL(place.imagePreviewUrl);
      });
    };
  }, []);

  const selectedPlaceIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const addSelectedPlace = async (
    place: PlaceItem,
    imageFile: File,
    imagePreviewUrl: string
  ) => {
    if (selectedPlacesRef.current.some((item) => item.id === place.id)) {
      URL.revokeObjectURL(imagePreviewUrl);
      return;
    }

    const imageKey = await uploadCourseImage(imageFile);
    if (selectedPlacesRef.current.some((item) => item.id === place.id)) {
      URL.revokeObjectURL(imagePreviewUrl);
      return;
    }

    const next = [
      ...selectedPlacesRef.current,
      { ...place, imageFile, imagePreviewUrl, imageKey },
    ];
    setSelectedPlaces(next);
    setPlacesInStore(next);
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    const target = selectedPlaces.find((item) => item.id === place.id);
    if (target) {
      URL.revokeObjectURL(target.imagePreviewUrl);
    }
    const next = selectedPlaces.filter((item) => item.id !== place.id);
    setSelectedPlaces(next);
    setPlacesInStore(next);
  };

  const removeAllSelectedPlaces = () => {
    selectedPlaces.forEach((place) => {
      URL.revokeObjectURL(place.imagePreviewUrl);
    });
    setSelectedPlaces([]);
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
