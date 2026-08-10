export interface SavedTravelRecordState {
  id: string;
  year: number;
}

export function getSavedTravelRecordId(state: unknown) {
  if (!state || typeof state !== 'object') return null;

  const savedTravelRecordId = (state as Record<string, unknown>)
    .savedTravelRecordId;

  return typeof savedTravelRecordId === 'string' ? savedTravelRecordId : null;
}

export function getSavedTravelRecordState(
  state: unknown,
): SavedTravelRecordState | null {
  const id = getSavedTravelRecordId(state);

  if (!id || !state || typeof state !== 'object') return null;

  const year = (state as Record<string, unknown>).savedTravelRecordYear;

  return typeof year === 'number' && Number.isInteger(year)
    ? { id, year }
    : null;
}
