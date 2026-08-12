export interface PlacePhotoLookup {
  readonly name: string;
  readonly address?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}
export interface PlacePhoto {
  readonly photoUri: string;
}

export async function getPlacePhoto(
  lookup: PlacePhotoLookup,
  signal?: AbortSignal
): Promise<PlacePhoto | null> {
  const response = await fetch('/google-places/photo', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(lookup),
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve place photo.');
  }

  return (await response.json()) as PlacePhoto | null;
}
