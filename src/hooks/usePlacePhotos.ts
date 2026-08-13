import { useQueries } from '@tanstack/react-query';

import {
  getPlacePhoto,
  type PlacePhotoLookup,
} from '../apis/googlePlacesPhoto';
import { createRequestQueue } from './utils/createRequestQueue';

export interface PlacePhotoLookupItem extends PlacePhotoLookup {
  readonly id: string | number;
}

export interface PlacePhotoState {
  readonly photoUri: string | null;
  /** True while the Google Places lookup for this item is still in flight (no result yet). */
  readonly isLoading: boolean;
}

const PLACE_PHOTO_STALE_TIME = 1000 * 60 * 30;
const PLACE_PHOTO_GC_TIME = 1000 * 60 * 60;
const PLACE_PHOTO_CONCURRENCY = 4;
const queuePlacePhotoRequest = createRequestQueue(PLACE_PHOTO_CONCURRENCY);

export function usePlacePhotos(
  places: readonly PlacePhotoLookupItem[]
): ReadonlyMap<string | number, PlacePhotoState> {
  const queries = useQueries({
    queries: places.map((place) => ({
      queryKey: [
        'placePhoto',
        place.name,
        place.address ?? '',
        place.latitude ?? null,
        place.longitude ?? null,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        queuePlacePhotoRequest(() => getPlacePhoto(place, signal)),
      staleTime: PLACE_PHOTO_STALE_TIME,
      gcTime: PLACE_PHOTO_GC_TIME,
      retry: false,
    })),
  });

  return new Map(
    places.map((place, index) => {
      const query = queries[index];

      return [
        place.id,
        {
          photoUri: query?.data?.photoUri ?? null,
          isLoading: query?.isLoading ?? false,
        },
      ] as const;
    })
  );
}
