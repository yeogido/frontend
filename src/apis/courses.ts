import { apiClient, normalizeApiError } from './common';

export type CourseDetailItem =
  | {
      order: number;
      type: 'PLACE';
      courseItemId: number;
      placeId: number;
      isLiked: boolean;
      source: string;
      externalPlaceId: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageUrl: string;
      imageKey?: string;
    }
  | {
      order: number;
      type: 'CONTENT';
      courseItemId: number;
      contentId: number;
      isLiked: boolean;
      contentStatus: string;
      source: string;
      externalPlaceId: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageUrl: string;
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
  description: string;
  tags: string[];
  durationType: string;
  transportType: string;
  startMonth: number;
  endMonth: number;
  companionType: string;
  isLiked: boolean;
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

  return data;
}

export async function deleteCourse(courseId: number): Promise<void> {
  try {
    await apiClient.delete(`/courses/${courseId}`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export type UpdateCourseItem =
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

// regionId는 여기 없다 — 라이브 스펙(CourseUpdateRequest)에 아예 필드가
// 없어 지역은 수정 대상이 아니다.
export interface UpdateCourseRequest {
  title: string;
  description: string;
  durationType: 'DAY_TRIP' | 'ONE_NIGHT' | 'TWO_NIGHT' | 'THREE_PLUS';
  transportType: 'WALK' | 'PUBLIC' | 'CAR';
  companionType: 'SOLO' | 'FRIEND' | 'COUPLE' | 'FAMILY' | 'PET';
  monthStart: number;
  monthEnd: number;
  thumbnailKey: string;
  hashtagIds: number[];
  courseItems: UpdateCourseItem[];
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
 * COURSE_ITEM: sourceId는 courseItemId. 코스 응답의 courseItems엔 별도
 * courseItemId가 내려오지 않고 placeId만 있어, sourceId로 placeId를 그대로 쓴다.
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
