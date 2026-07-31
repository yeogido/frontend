import {
  type InfiniteData,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { getCourses } from '../apis/courses.api';
import type { NormalizedApiError } from '../apis/common';
import type {
  GetCoursesParams,
  GetCoursesResponse,
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
