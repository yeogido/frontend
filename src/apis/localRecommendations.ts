export type CourseItem =
  | {
      order: number;
      type: 'PLACE';
      externalPlaceId: string;
      categoryGroupCode: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageKey: string;
    }
  | { order: number; type: 'CONTENT'; contentId: number };

export interface CreateLocalRecommendationRequest {
  title: string;
  regionId: number;
  description: string;
  durationType:
    | 'DAY_TRIP'
    | 'ONE_NIGHT_TWO_DAYS'
    | 'TWO_NIGHTS_THREE_DAYS'
    | 'THREE_NIGHTS_FOUR_DAYS'
    | 'FOUR_NIGHTS_OR_MORE';
  transportType: 'WALK' | 'CAR';
  companionType: 'SOLO' | 'FRIEND' | 'COUPLE' | 'FAMILY' | 'CHILDREN';
  monthStart: number;
  monthEnd: number;
  thumbnailKey: string;
  hashtagIds: number[];
  courseItems: CourseItem[];
}

export interface CreateLocalRecommendationResult {
  courseId: number;
}

interface CourseClient {
  post<Result>(
    path: string,
    payload: CreateLocalRecommendationRequest
  ): Promise<{ data: Result }>;
}

// apiClient's response interceptor already unwraps the { isSuccess, result }
// envelope on success and rejects with a NormalizedApiError on failure, so
// this just passes the (already-unwrapped) response data through.
export async function createLocalRecommendationWithClient<Result>(
  client: CourseClient,
  payload: CreateLocalRecommendationRequest
): Promise<Result> {
  const response = await client.post<Result>('/courses', payload);

  return response.data;
}

export async function createLocalRecommendation(
  payload: CreateLocalRecommendationRequest
): Promise<CreateLocalRecommendationResult> {
  const { apiClient } = await import('./common');

  return createLocalRecommendationWithClient<CreateLocalRecommendationResult>(
    apiClient,
    payload
  );
}
