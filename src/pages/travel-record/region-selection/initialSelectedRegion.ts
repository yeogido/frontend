import type { TravelRecordRegion } from './types';

type StoredTravelRecordRegion = Omit<TravelRecordRegion, 'imageSrc'>;

export function getInitialTravelRecordRegion(
  isEditing: boolean,
  storedRegion: StoredTravelRecordRegion | null,
): TravelRecordRegion | null {
  if (!isEditing || !storedRegion) {
    return null;
  }

  return { ...storedRegion, imageSrc: '' };
}
