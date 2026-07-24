import { useMemo, useState } from 'react';

import type { PlaceItem, SelectedPlace } from '../types';

export function useSelectedPlaces() {
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);

  const selectedPlaceIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const addSelectedPlace = (
    place: PlaceItem,
    imageFile: File,
    imagePreviewUrl: string
  ) => {
    setSelectedPlaces((items) => [
      ...items,
      {
        ...place,
        imageFile,
        imagePreviewUrl,
      },
    ]);
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    URL.revokeObjectURL(place.imagePreviewUrl);
    setSelectedPlaces((items) => items.filter((item) => item.id !== place.id));
  };

  const removeAllSelectedPlaces = () => {
    selectedPlaces.forEach((place) => URL.revokeObjectURL(place.imagePreviewUrl));
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
