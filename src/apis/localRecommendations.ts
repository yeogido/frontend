export type CourseItem =
  | {
      order: number;
      type: 'PLACE';
      externalPlaceId: string;
      /** 라이브 스펙에서 PLACE의 선택 필드 — 모르면 아예 보내지 않는다(빈 문자열 금지). */
      categoryGroupCode?: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageKey: string | null;
    }
  | { order: number; type: 'CONTENT'; contentId: number };

export interface CreateLocalRecommendationRequest {
  title: string;
  regionId: number;
  description: string;
  durationType:
    | 'DAY_TRIP'
    | 'ONE_NIGHT'
    | 'TWO_NIGHT'
    | 'THREE_PLUS';
  transportType: 'WALK' | 'PUBLIC' | 'CAR';
  companionType: 'SOLO' | 'FRIEND' | 'COUPLE' | 'FAMILY' | 'PET';
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
