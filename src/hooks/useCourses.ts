import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getApiErrorMessage } from '../apis/common';
import { useToast } from '../components/toast';
import { buildCourseDetailPath } from '../utils/routes';

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

/**
 * 코스 상세로 이동한다.
 *
 * 후기 응답에는 코스 타입이 없어서 어느 상세 라우트로 보낼지 알 수 없다.
 * 상세를 먼저 받아 courseType을 보고 경로를 정한다. 잘못된 라우트로 보내면
 * 상세 페이지가 NotFound를 띄우기 때문에 추측으로 보낼 수 없다.
 * 백엔드가 ReviewCourse에 courseType을 추가하면 이 조회를 걷어낼 수 있다.
 */
export function useNavigateToCourseDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isResolvingCourse, setIsResolvingCourse] = useState(false);

  const goToCourseDetail = async (courseId: number) => {
    if (isResolvingCourse) {
      return;
    }

    setIsResolvingCourse(true);

    try {
      const course = await queryClient.fetchQuery({
        queryKey: ['courseDetail', courseId],
        queryFn: () => getCourseDetail(courseId),
        staleTime: DETAIL_STALE_TIME,
      });

      navigate(buildCourseDetailPath(course.courseType, courseId));
    } catch (error) {
      showToast(getApiErrorMessage(error, '코스를 열지 못했어요.'));
    } finally {
      setIsResolvingCourse(false);
    }
  };

  return { goToCourseDetail, isResolvingCourse };
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
