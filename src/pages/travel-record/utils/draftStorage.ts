import type { TravelRecordDraftRegion } from '../types';

const TRAVEL_RECORD_DRAFT_REGION_KEY = 'travel-record-draft-region';

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
