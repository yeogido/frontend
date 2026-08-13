import { fetchWithTimeout } from './fetchWithTimeout.js';
import { toOptionalCoordinate, toOptionalString } from './parseRequest.js';

export interface PlaceHoursRequest {
  readonly name?: unknown;
  readonly address?: unknown;
  readonly latitude?: unknown;
  readonly longitude?: unknown;
}
export interface PlaceHoursResponse {
  readonly currentWeekdayDescriptions: readonly string[];
  readonly regularWeekdayDescriptions: readonly string[];
  readonly openNow?: boolean;
  readonly nextOpenTime?: string;
  readonly nextCloseTime?: string;
}

interface GoogleOpeningHours {
  readonly weekdayDescriptions?: readonly string[];
  readonly openNow?: boolean;
  readonly nextOpenTime?: string;
  readonly nextCloseTime?: string;
}

interface GooglePlaceDetails {
  readonly currentOpeningHours?: GoogleOpeningHours;
  readonly regularOpeningHours?: GoogleOpeningHours;
}

interface GoogleTextSearchResponse {
  readonly places?: readonly { readonly id?: string }[];
}

export class InvalidPlaceHoursRequestError extends Error {}

export async function lookupPlaceHours(
  requestBody: PlaceHoursRequest,
  apiKey: string
): Promise<PlaceHoursResponse | null> {
  const name = toOptionalString(requestBody.name);
  const address = toOptionalString(requestBody.address);
  const latitude = toOptionalCoordinate(requestBody.latitude);
  const longitude = toOptionalCoordinate(requestBody.longitude);

  if (!name) {
    throw new InvalidPlaceHoursRequestError('Place name is required.');
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

  const searchResponse = await fetchWithTimeout(
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

  if (!searchResponse.ok) {
    throw new Error('Google place search failed.');
  }

  const searchResult =
    (await searchResponse.json()) as GoogleTextSearchResponse;
  const placeId = searchResult.places?.[0]?.id;

  if (!placeId) {
    return null;
  }

  const detailsResponse = await fetchWithTimeout(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ko`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'currentOpeningHours,regularOpeningHours',
      },
    }
  );

  if (!detailsResponse.ok) {
    throw new Error('Google place details failed.');
  }

  const details = (await detailsResponse.json()) as GooglePlaceDetails;
  const currentHours = details.currentOpeningHours;
  const regularHours = details.regularOpeningHours;

  if (!currentHours && !regularHours) {
    return null;
  }

  return {
    currentWeekdayDescriptions: currentHours?.weekdayDescriptions ?? [],
    regularWeekdayDescriptions: regularHours?.weekdayDescriptions ?? [],
    openNow: currentHours?.openNow,
    nextOpenTime: currentHours?.nextOpenTime,
    nextCloseTime: currentHours?.nextCloseTime,
  };
}
