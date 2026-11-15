import type { TravelDateRange } from '../date-selection/types';
import type { TravelRecordDraftRegion } from '../types';
import type { TravelRecordApiVisibility } from '../../../types/travelRecord.type';

export interface SelectedPhoto {
  id: string;
  url: string;
  source: 'new' | 'server';
  file?: File;
  imageKey?: string;
}

export interface TravelFolderDecorationLocationState {
  selectedRegion?: TravelRecordDraftRegion;
  selectedDateRange?: TravelDateRange;
  photoDraftId?: string;
  visibility?: TravelRecordApiVisibility;
}
