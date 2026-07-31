import { apiClient } from './common';

export type CourseDetailItem =
  | {
      order: number;
      type: 'PLACE';
      placeId: number;
      isLiked: boolean;
      source: string;
      externalPlaceId: string;
      name: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
    }
  | {
      order: number;
      type: 'CONTENT';
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

export async function addCourseLike(
  courseId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.post<CourseLikeResult>(
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

export async function addPlaceLike(
  placeId: number
): Promise<CourseLikeResult> {
  const { data } = await apiClient.post<CourseLikeResult>(
    `/places/${placeId}/likes`
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
  const { data } = await apiClient.post<CourseLikeResult>(
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
