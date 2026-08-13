import type { TravelRecordDraftRegion } from '../types';
import type { TravelDateRange } from '../date-selection/types';

const TRAVEL_RECORD_DRAFT_REGION_KEY = 'travel-record-draft-region';
const TRAVEL_RECORD_DRAFT_DATE_RANGE_KEY = 'travel-record-draft-date-range';

interface StoredTravelDateRange {
  startDate: string;
  endDate: string;
}

const isTravelRecordDraftRegion = (
  value: unknown,
): value is TravelRecordDraftRegion => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const region = value as Record<string, unknown>;

  return (
    typeof region.id === 'string' &&
    typeof region.name === 'string' &&
    typeof region.province === 'string' &&
    typeof region.selectionName === 'string'
  );
};

export const saveTravelRecordDraftRegion = (
  region: TravelRecordDraftRegion,
) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      TRAVEL_RECORD_DRAFT_REGION_KEY,
      JSON.stringify(region),
    );
  } catch {
    // Storage can be blocked or full. Continue without a persisted draft.
  }
};

export const getTravelRecordDraftRegion = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  let storedRegion: string | null;

  try {
    storedRegion = window.sessionStorage.getItem(
      TRAVEL_RECORD_DRAFT_REGION_KEY,
    );
  } catch {
    return null;
  }

  try {
    if (!storedRegion) {
      return null;
    }

    const parsedRegion: unknown = JSON.parse(storedRegion);

    return isTravelRecordDraftRegion(parsedRegion) ? parsedRegion : null;
  } catch {
    return null;
  }
};

const formatStoredDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseStoredDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const isStoredTravelDateRange = (
  value: unknown,
): value is StoredTravelDateRange => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const range = value as Record<string, unknown>;

  return (
    typeof range.startDate === 'string' && typeof range.endDate === 'string'
  );
};

export const saveTravelRecordDraftDateRange = (range: TravelDateRange) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      TRAVEL_RECORD_DRAFT_DATE_RANGE_KEY,
      JSON.stringify({
        startDate: formatStoredDate(range.startDate),
        endDate: formatStoredDate(range.endDate),
      }),
    );
  } catch {
    // Storage can be blocked or full. Continue without a persisted draft.
  }
};

export const clearTravelRecordDraftDateRange = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(TRAVEL_RECORD_DRAFT_DATE_RANGE_KEY);
  } catch {
    // Storage can be blocked. Continue with the new date selection state.
  }
};

export const getTravelRecordDraftDateRange = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  let storedRange: string | null;

  try {
    storedRange = window.sessionStorage.getItem(
      TRAVEL_RECORD_DRAFT_DATE_RANGE_KEY,
    );
  } catch {
    return null;
  }

  try {
    if (!storedRange) {
      return null;
    }

    const parsedRange: unknown = JSON.parse(storedRange);

    if (!isStoredTravelDateRange(parsedRange)) {
      return null;
    }

    const startDate = parseStoredDate(parsedRange.startDate);
    const endDate = parseStoredDate(parsedRange.endDate);

    if (!startDate || !endDate) {
      return null;
    }

    return { startDate, endDate };
  } catch {
    return null;
  }
};
