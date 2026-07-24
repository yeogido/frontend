import type { TravelDateRange } from '../date-selection/types';
import type { TravelRecordDraftRegion } from '../types';

export interface CreateTravelRecordPayload {
  regionCode: string;
  regionName: string;
  startDate: Date;
  endDate: Date;
  photos: File[];
}

export interface SavedTravelRecordResult {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotoUrls: string[];
}

interface CreateTravelRecordDraftPayloadParams {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: File[];
}

export const createTravelRecordDraftPayload = ({
  selectedRegion,
  selectedDateRange,
  selectedPhotos,
}: CreateTravelRecordDraftPayloadParams): CreateTravelRecordPayload => ({
  regionCode: selectedRegion.id,
  regionName: selectedRegion.selectionName || selectedRegion.name,
  startDate: selectedDateRange.startDate,
  endDate: selectedDateRange.endDate,
  photos: selectedPhotos,
});

export const saveTravelRecord = (
  payload: CreateTravelRecordPayload,
  context: {
    selectedRegion: TravelRecordDraftRegion;
    selectedDateRange: TravelDateRange;
  },
): Promise<SavedTravelRecordResult> =>
  Promise.resolve({
    selectedRegion: context.selectedRegion,
    selectedDateRange: context.selectedDateRange,
    selectedPhotoUrls: payload.photos
      .slice(0, 2)
      .map((photo) => URL.createObjectURL(photo)),
  });
