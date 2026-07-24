import { useEffect, useMemo, useRef, useState } from 'react';

import type { PlaceItem, SelectedPlace } from '../types';

export function useSelectedPlaces() {
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

  const addSelectedPlace = (
    place: PlaceItem,
    imageFile: File,
    imagePreviewUrl: string
  ) => {
    setSelectedPlaces((items) => {
      const alreadyExists = items.some((item) => item.id === place.id);

      if (alreadyExists) {
        URL.revokeObjectURL(imagePreviewUrl);
        return items;
      }

      return [
        ...items,
        {
          ...place,
          imageFile,
          imagePreviewUrl,
        },
      ];
    });
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    setSelectedPlaces((items) => {
      const target = items.find((item) => item.id === place.id);

      if (target) {
        URL.revokeObjectURL(target.imagePreviewUrl);
      }

      return items.filter((item) => item.id !== place.id);
    });
  };

  const removeAllSelectedPlaces = () => {
    setSelectedPlaces((items) => {
      items.forEach((place) => {
        URL.revokeObjectURL(place.imagePreviewUrl);
      });

      return [];
    });
  };

  return {
    selectedPlaces,
    selectedPlaceIds,
    addSelectedPlace,
    removeSelectedPlace,
    removeAllSelectedPlaces,
  };
}