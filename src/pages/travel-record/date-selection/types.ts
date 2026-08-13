import type { TravelRecordDraftRegion } from '../types';

export type TravelDatePreset = 'today' | 'yesterday' | 'this-week' | 'custom';

export interface CalendarDate {
  date: Date;
  day: number;
  monthIndex: number;
  isCurrentMonth: boolean;
}

export interface TravelDateRange {
  startDate: Date;
  endDate: Date;
}

export interface TravelDateSelectionLocationState {
  selectedRegion?: TravelRecordDraftRegion;
}

export interface TravelPhotoSelectionLocationState {
  selectedRegion?: TravelRecordDraftRegion;
  selectedDateRange?: TravelDateRange;
}
