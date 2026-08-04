import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import {
  getCourses,
  getPopularCourses,
  getRecommendedCourses,
} from '../apis/courses.api';
import {
  addCourseLike,
  getCourseDetail,
  removeCourseLike,
} from '../apis/courses';
import type { CourseDetailResult } from '../apis/courses';
import type { NormalizedApiError } from '../apis/common';
import type {
  Course,
  GetCoursesParams,
  GetCoursesResponse,
  GetPopularCoursesParams,
  RecommendedCourse,
} from '../types/course.type';

const DETAIL_STALE_TIME = 1000 * 60;
const DETAIL_GC_TIME = 1000 * 60 * 5;

interface CoursesPageParam {
  cursorValue?: string;
  cursorId?: number;
}

export function useCourses(
  params: GetCoursesParams,
  options?: { enabled?: boolean }
) {
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
    enabled: options?.enabled,
  });
}

export function usePopularCourses(
  params: GetPopularCoursesParams,
  options?: { enabled?: boolean }
) {
  return useQuery<Course[], NormalizedApiError>({
    queryKey: ['popularCourses', params],
    queryFn: () => getPopularCourses(params),
    enabled: options?.enabled,
  });
}

export function useRecommendedCourses() {
  return useQuery<RecommendedCourse[], NormalizedApiError>({
    queryKey: ['recommendedCourses'],
    queryFn: getRecommendedCourses,
  });
}

/**
 * 코스 상세. 여기도/동네 코스 모두 GET /courses/{courseId} 하나를 쓴다.
 *
 * 상세 페이지들은 각자 화면 전용 캐시 키로 같은 조회를 따로 갖고 있어서,
 * 상세 화면 밖(리뷰 작성 등)에서 코스를 읽어야 할 때 쓰라고 공용으로 둔다.
 */
export function useCourseDetail(courseId: number | null) {
  return useQuery<CourseDetailResult, NormalizedApiError>({
    queryKey: ['courseDetail', courseId],
    queryFn: () => getCourseDetail(courseId as number),
    enabled: courseId !== null,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
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
