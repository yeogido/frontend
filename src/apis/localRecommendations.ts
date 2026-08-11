import { apiClient } from './common';
import type { DayOfWeek } from '../utils/operatingHours';

export interface OperatingDay {
  dayOfWeek: DayOfWeek;
  /** HH:mm */
  openTime: string;
  /** HH:mm */
  closeTime: string;
}

export type TransportMode = 'WALK' | 'PUBLIC' | 'CAR';

export interface TimeFromPrevious {
  transportMode: TransportMode;
  durationMinutes: number;
}

export type CourseItem =
  | {
      order: number;
      type: 'PLACE';
      externalPlaceId: string;
      /** 라이브 스펙에서 PLACE의 선택 필드 — 모르면 아예 보내지 않는다(빈 문자열 금지). */
      categoryGroupCode?: string;
      name: string;
      roadAddress: string | null;
      lotAddress: string | null;
      latitude: number;
      longitude: number;
      imageKey: string | null;
      /** 장소 영업시간 — 모르면 아예 보내지 않는다(기존 값 유지). */
      operatingDays?: OperatingDay[];
      /** 이전 코스 아이템과의 이동 소요시간 — 첫 번째 아이템에는 없다. */
      timesFromPrevious?: TimeFromPrevious[];
    }
  | {
      order: number;
      type: 'CONTENT';
      contentId: number;
      timesFromPrevious?: TimeFromPrevious[];
    };

export interface CreateLocalRecommendationRequest {
  title: string;
  regionId: number;
  description: string;
  durationType: 'DAY_TRIP' | 'ONE_NIGHT' | 'TWO_NIGHT' | 'THREE_PLUS';
  // 라이브 스펙(CourseCreateRequest) 기준 이동수단은 WALK/CAR만 받는다 —
  // PUBLIC은 더 이상 유효한 요청 값이 아니다(과거 데이터에만 남아 있을 수
  // 있고, 그건 응답 쪽 CourseDetailResult.transportType이 느슨한 string인
  // 이유이기도 하다).
  transportType: 'WALK' | 'CAR';
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
  return createLocalRecommendationWithClient<CreateLocalRecommendationResult>(
    apiClient,
    payload
  );
}
