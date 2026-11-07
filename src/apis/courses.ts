import { apiClient, normalizeApiError } from './common';
import { withRouteImage } from './courses.api';
import type {
  CourseItem as UpdateCourseItem,
  OperatingDay,
  TimeFromPrevious,
} from './localRecommendations';

export type CourseDetailItem =
  | {
      /** 일차 API 확장 필드. 없으면 상세 화면에서 1일차로 표시한다. */
      day?: number;
      order: number;
      type: 'PLACE';
      courseItemId: number;
      placeId: number;
      isLiked: boolean;
      source: string;
      externalPlaceId: string;
      categoryGroupCode: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageUrl: string;
      imageKey?: string;
      operatingDays: OperatingDay[];
      timesFromPrevious: TimeFromPrevious[];
    }
  | {
      day?: number;
      order: number;
      type: 'CONTENT';
      courseItemId: number;
      contentId: number;
      isLiked: boolean;
      contentStatus: string;
      source: string;
      externalPlaceId: string;
      categoryGroupCode: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageUrl: string;
      timesFromPrevious: TimeFromPrevious[];
    };

export interface CourseDetailAuthor {
  nickname: string;
  profileImageUrl: string | null;
}

export interface CourseDetailResult {
  courseId: number;
  courseType: string;
  title: string;
  thumbnailUrl: string;
  routeImageUrl?: string | null;
  description: string;
  tags: string[];
  durationType: string;
  /**
   * 코스의 실제 여행 일수. 일차 확장 이전 응답에는 없을 수 있어 optional이다 —
   * 읽을 때는 resolveCourseTotalDays(utils/courseDetail)로 보정한다.
   */
  totalDays?: number;
  transportType: string;
  startMonth: number;
  endMonth: number;
  companionType: string;
  isLiked: boolean;
  canManage: boolean;
  courseItems: CourseDetailItem[];
  author?: CourseDetailAuthor;
}

export interface CourseLikeResult {
  isLiked: boolean;
  likeCount: number;
}

export async function getCourseDetail(
  courseId: number
): Promise<CourseDetailResult> {
  const { data } = await apiClient.get<CourseDetailResult>(
    `/courses/${courseId}`
  );

  return withRouteImage(data);
}

// 리뷰 작성 화면 전용 — 코스 상세 전체(courseItems 등)를 받을 필요 없이
// 카드에 필요한 필드만 오는 가벼운 엔드포인트.
export interface CourseSummaryResult {
  courseId: number;
  title: string;
  thumbnailUrl: string;
  durationType: string;
  transportType: string;
  companionType: string;
}

export async function getCourseSummary(
  courseId: number
): Promise<CourseSummaryResult> {
  const { data } = await apiClient.get<CourseSummaryResult>(
    `/courses/${courseId}/summary`
  );

  return data;
}

export async function deleteCourse(courseId: number): Promise<void> {
  try {
    await apiClient.delete(`/courses/${courseId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// CourseItem(생성 요청)과 필드가 완전히 같아, 여기서 다시 정의하지 않고
// 그대로 재사용한다(operatingDays/timesFromPrevious 포함).
export type { UpdateCourseItem };

/**
 * PATCH는 전달한 필드만 수정한다 — 모든 필드가 선택이다. 보내지 않은 필드는
 * 서버가 기존 값을 유지하므로, 바꾸지 않을 값은 아예 빼는 쪽이 안전하다.
 * (특히 hashtagIds는 전달 시 전체 교체, courseItems는 전달 시 일정 전체 교체다.)
 *
 * regionId는 여기 없다 — 라이브 스펙(CourseUpdateRequest)에 아예 필드가 없어
 * 지역은 수정 대상이 아니다.
 */
export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  durationType?: 'DAY_TRIP' | 'ONE_NIGHT' | 'TWO_NIGHT' | 'THREE_PLUS';
  /**
   * 실제 여행 일수. durationType을 바꿀 때는 필수이며, 일수가 달라지면
   * courseItems 전체를 함께 보내야 한다(빈 배열 불가).
   */
  totalDays?: number;
  // 라이브 스펙(CourseUpdateRequest) 기준 이동수단은 WALK/CAR만 받는다 —
  // PUBLIC은 더 이상 유효한 요청 값이 아니다.
  transportType?: 'WALK' | 'CAR';
  companionType?: 'SOLO' | 'FRIEND' | 'COUPLE' | 'FAMILY' | 'PET';
  monthStart?: number;
  monthEnd?: number;
  thumbnailKey?: string;
  routeImageKey?: string;
  /** 전달 시 기존 해시태그를 모두 지우고 교체한다. 최대 5개. */
  hashtagIds?: number[];
  /** 전달 시 모든 일차의 기존 일정을 지우고 교체한다. 빈 배열은 허용되지 않는다. */
  courseItems?: UpdateCourseItem[];
}

export interface UpdateCourseResult {
  courseId: number;
}

export async function updateCourse(
  courseId: number,
  payload: UpdateCourseRequest
): Promise<UpdateCourseResult> {
  try {
    const { data } = await apiClient.patch<UpdateCourseResult>(
      `/courses/${courseId}`,
      payload
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// 코스·문화콘텐츠·장소 좋아요 등록은 모두 PUT이다. 여러 번 눌러도 같은
// 결과가 되도록 백엔드가 바꿨다.
export async function addCourseLike(
  courseId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.put<CourseLikeResult>(
    `/courses/${courseId}/likes`
  );

  return data;
}

export async function removeCourseLike(
  courseId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.delete<CourseLikeResult>(
    `/courses/${courseId}/likes`
  );

  return data;
}

/**
 * COURSE_ITEM: sourceId는 courseItemId다.
 * 코스 응답의 courseItems에서 courseItemId를 사용한다.
 * 행사 상세(festival)의 연계 장소 좋아요는 CONTENT로 보낸다(sourceId는 contentId).
 * PROMOTION: sourceId는 promotionId.
 */
export type PlaceLikeSourceType = 'COURSE_ITEM' | 'PROMOTION' | 'CONTENT';

export async function addPlaceLike(
  placeId: number,
  sourceType: PlaceLikeSourceType,
  sourceId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.put<CourseLikeResult>(
    `/places/${placeId}/likes`,
    { sourceType, sourceId }
  );

  return data;
}

export async function removePlaceLike(
  placeId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.delete<CourseLikeResult>(
    `/places/${placeId}/likes`
  );

  return data;
}

export async function addContentLike(
  contentId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.put<CourseLikeResult>(
    `/contents/${contentId}/likes`
  );

  return data;
}

export async function removeContentLike(
  contentId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.delete<CourseLikeResult>(
    `/contents/${contentId}/likes`
  );

  return data;
}
