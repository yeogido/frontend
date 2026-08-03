import { apiClient, normalizeApiError } from './common';

import type {
  Course,
  GetCoursesParams,
  GetCoursesResponse,
  GetPopularCoursesParams,
} from '../types/course.type';

export async function getCourses(
  params: GetCoursesParams,
): Promise<GetCoursesResponse> {
  try {
    const { data } = await apiClient.get<GetCoursesResponse>('/courses', {
      params,
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
