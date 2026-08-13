import { fetchWithTimeout } from './fetchWithTimeout.js';
import { toOptionalCoordinate, toOptionalString } from './parseRequest.js';

export interface PlacePhotoRequest {
  readonly name?: unknown;
  readonly address?: unknown;
  readonly latitude?: unknown;
  readonly longitude?: unknown;
}
export interface PlacePhotoResponse {
  readonly photoUri: string;
}

interface GooglePlacePhoto {
  readonly name?: string;
}

interface GooglePlaceDetails {
  readonly photos?: readonly GooglePlacePhoto[];
}

interface GoogleTextSearchResponse {
  readonly places?: readonly { readonly id?: string }[];
}

interface GooglePhotoMedia {
  readonly photoUri?: string;
}

const PHOTO_MAX_WIDTH_PX = 800;

export class InvalidPlacePhotoRequestError extends Error {}

function fetchTextSearch(
  textSearchBody: Record<string, unknown>,
  apiKey: string
): Promise<Response> {
  return fetchWithTimeout(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify(textSearchBody),
    }
  );
}

function fetchPlaceDetails(placeId: string, apiKey: string): Promise<Response> {
  return fetchWithTimeout(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ko`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'photos',
      },
    }
  );
}

function fetchMedia(photoName: string, apiKey: string): Promise<Response> {
  return fetchWithTimeout(
    `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${PHOTO_MAX_WIDTH_PX}&skipHttpRedirect=true`,
    {
      headers: { 'X-Goog-Api-Key': apiKey },
    }
  );
}

export async function lookupPlacePhoto(
  requestBody: unknown,
  apiKey: string
): Promise<PlacePhotoResponse | null> {
  if (typeof requestBody !== 'object' || requestBody === null) {
    throw new InvalidPlacePhotoRequestError('Request body must be an object.');
  }

  const body = requestBody as PlacePhotoRequest;
  const name = toOptionalString(body.name);
  const address = toOptionalString(body.address);
  const latitude = toOptionalCoordinate(body.latitude);
  const longitude = toOptionalCoordinate(body.longitude);

  if (!name) {
    throw new InvalidPlacePhotoRequestError('Place name is required.');
  }

  const textSearchBody: Record<string, unknown> = {
    textQuery: [name, address].filter(Boolean).join(' '),
    languageCode: 'ko',
  };

  if (latitude !== undefined && longitude !== undefined) {
    textSearchBody.locationBias = {
      circle: {
        center: { latitude, longitude },
        radius: 1_000,
      },
    };
  }

  const searchResponse = await fetchTextSearch(textSearchBody, apiKey);

  if (!searchResponse.ok) {
    throw new Error('Google place search failed.');
  }

  const searchResult =
    (await searchResponse.json()) as GoogleTextSearchResponse;
  const placeId = searchResult.places?.[0]?.id;

  if (!placeId) {
    return null;
  }

  const detailsResponse = await fetchPlaceDetails(placeId, apiKey);

  if (!detailsResponse.ok) {
    throw new Error('Google place details failed.');
  }

  const details = (await detailsResponse.json()) as GooglePlaceDetails;
  const photoName = details.photos?.[0]?.name;

  if (!photoName) {
    return null;
  }

  const mediaResponse = await fetchMedia(photoName, apiKey);

  if (!mediaResponse.ok) {
    throw new Error('Google place photo media failed.');
  }

  const media = (await mediaResponse.json()) as GooglePhotoMedia;

  return media.photoUri ? { photoUri: media.photoUri } : null;
}
