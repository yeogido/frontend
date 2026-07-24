import type { TravelDateRange } from '../date-selection/types';
import type { TravelRecordDraftRegion } from '../types';

export interface SelectedPhoto {
  id: string;
  file: File;
  url: string;
}

export interface TravelFolderDecorationLocationState {
  selectedRegion?: TravelRecordDraftRegion;
  selectedDateRange?: TravelDateRange;
  selectedPhotos?: File[];
}
