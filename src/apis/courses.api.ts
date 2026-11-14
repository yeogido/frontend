import { apiClient, normalizeApiError } from './common';

import type {
  Course,
  GetCoursesParams,
  GetCoursesResponse,
  GetPopularCoursesParams,
  PopularLocalCourse,
  RecommendedCourse,
} from '../types/course.type';

export function withRouteImage<
  T extends { thumbnailUrl: string; routeImageUrl?: string | null },
>(course: T): T {
  const routeImageUrl = course.routeImageUrl?.trim();

  return routeImageUrl
    ? { ...course, thumbnailUrl: routeImageUrl, routeImageUrl }
    : course;
}

export async function getCourses(
  params: GetCoursesParams,
): Promise<GetCoursesResponse> {
  try {
    const { data } = await apiClient.get<GetCoursesResponse>('/courses', {
      params,
      // 서버는 배열을 keywords=a&keywords=b로만 읽는다. axios 기본값인
      // keywords[]=a 형식은 COURSE4010으로 거절된다.
      paramsSerializer: { indexes: null },
    });

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getPopularCourses(
  params: GetPopularCoursesParams,
): Promise<Course[]> {
  try {
    const { data } = await apiClient.get<Course[]>('/courses/popular', {
      params,
    });

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getPopularLocalCourses(): Promise<PopularLocalCourse[]> {
  try {
    const { data } = await apiClient.get<PopularLocalCourse[]>(
      '/courses/popular/local',
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getRecommendedCourses(): Promise<RecommendedCourse[]> {
  try {
    const { data } = await apiClient.get<RecommendedCourse[]>(
      '/courses/recommended',
    );

    return data.map(withRouteImage);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
