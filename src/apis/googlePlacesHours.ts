export interface PlaceHoursLookup {
  readonly name: string;
  readonly address?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}
export interface PlaceHours {
  readonly currentWeekdayDescriptions: readonly string[];
  readonly regularWeekdayDescriptions: readonly string[];
  readonly openNow?: boolean;
  readonly nextOpenTime?: string;
  readonly nextCloseTime?: string;
}

export async function getPlaceHours(
  lookup: PlaceHoursLookup,
  signal?: AbortSignal
): Promise<PlaceHours | null> {
  const response = await fetch('/google-places/hours', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(lookup),
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve place opening hours.');
  }

  return (await response.json()) as PlaceHours | null;
}
