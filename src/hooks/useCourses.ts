import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueries,
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
import { getCourseDetail } from '../apis/courses';
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
 * 여러 코스의 상세를 한꺼번에 읽는다.
 *
 * 후기 목록 응답의 course에는 해시태그와 동행이 없어서, 후기 카드에 그리려면
 * 코스별로 상세를 더 받아야 한다. useCourseDetail과 캐시 키가 같아 이 캐시를
 * 함께 쓴다.
 *
 * 백엔드가 ReviewCourse에 tags·companionType을 넣어주면 이 조회 전체를
 * 걷어낼 수 있다.
 */
export function useCourseDetails(courseIds: readonly number[]) {
  return useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ['courseDetail', courseId],
      queryFn: () => getCourseDetail(courseId),
      staleTime: DETAIL_STALE_TIME,
      gcTime: DETAIL_GC_TIME,
      refetchOnWindowFocus: false,
    })),
  });
}

/**
 * 코스 타입을 모르는 목록에서 코스 상세로 이동한다.
 *
 * 여기도(OFFICIAL)와 동네(LOCAL) 상세 라우트가 나뉘어 있고, 각 페이지는 자기
 * 타입이 아닌 코스를 받으면 NotFound를 띄운다. 그래서 타입을 추측해 보낼 수
 * 없고, 상세를 먼저 받아 courseType을 보고 경로를 정한다.
 *
 * 응답에 courseType이 들어 있는 목록(후기 등)은 이 훅을 쓰지 말고
 * buildCourseDetailPath로 바로 이동하면 된다. 지금은 찜 목록
 * (LikedResponse에 courseType이 없다)이 이 훅을 쓴다.
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
