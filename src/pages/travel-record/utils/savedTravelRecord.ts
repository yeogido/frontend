export function getSavedTravelRecordId(state: unknown) {
  if (!state || typeof state !== 'object') return null;

  const savedTravelRecordId = (state as Record<string, unknown>)
    .savedTravelRecordId;

  return typeof savedTravelRecordId === 'string' ? savedTravelRecordId : null;
}
