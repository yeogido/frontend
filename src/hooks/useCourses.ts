import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import { getCourses, getPopularCourses } from '../apis/courses.api';
import { addCourseLike, removeCourseLike } from '../apis/courses';
import type { NormalizedApiError } from '../apis/common';
import type {
  Course,
  GetCoursesParams,
  GetCoursesResponse,
  GetPopularCoursesParams,
} from '../types/course.type';

interface CoursesPageParam {
  cursorValue?: string;
  cursorId?: number;
}

export function useCourses(params: GetCoursesParams) {
  return useInfiniteQuery<
    GetCoursesResponse,
    NormalizedApiError,
    InfiniteData<GetCoursesResponse, CoursesPageParam>,
    [string, GetCoursesParams],
    CoursesPageParam
  >({
    queryKey: ['courses', params],
    queryFn: ({ pageParam }) =>
      getCourses({
        ...params,
        cursorValue: pageParam.cursorValue,
        cursorId: pageParam.cursorId,
      }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext
        ? {
            cursorValue: lastPage.cursorValue,
            cursorId: lastPage.cursorId,
          }
        : undefined,
  });
}

export function usePopularCourses(params: GetPopularCoursesParams) {
  return useQuery<Course[], NormalizedApiError>({
    queryKey: ['popularCourses', params],
    queryFn: () => getPopularCourses(params),
  });
}

export function useCourseLikeMutation() {
  return useMutation({
    mutationFn: ({
      courseId,
      isLiked,
    }: {
      courseId: number;
      isLiked: boolean;
    }) => (isLiked ? removeCourseLike(courseId) : addCourseLike(courseId)),
  });
}
