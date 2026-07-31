import { apiClient, normalizeApiError } from './common';

import type {
  GetCoursesParams,
  GetCoursesResponse,
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
