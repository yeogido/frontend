import {
  InvalidPlaceHoursRequestError,
  lookupPlaceHours,
  type PlaceHoursRequest,
} from './placeHours';

export const config = { runtime: 'edge' };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed.' }, 405);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return json({ message: 'Google Places API is not configured.' }, 503);
  }

  let requestBody: PlaceHoursRequest;
  try {
    requestBody = (await request.json()) as PlaceHoursRequest;
  } catch {
    return json({ message: 'Invalid request body.' }, 400);
  }

  try {
    return json(await lookupPlaceHours(requestBody, apiKey));
  } catch (error) {
    if (error instanceof InvalidPlaceHoursRequestError) {
      return json({ message: error.message }, 400);
    }

    return json({ message: 'Google Places request failed.' }, 502);
  }
}
