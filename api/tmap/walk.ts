import { handleWalkingRoute } from './_walkingRoute.js';

export const config = { runtime: 'edge' };

export default function handler(request: Request): Promise<Response> {
  return handleWalkingRoute(request, process.env.TMAP_API_KEY);
}
