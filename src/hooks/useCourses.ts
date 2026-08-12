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
import { removeRecentCourse } from '../utils/recentCourses';
import { buildCourseDetailPath } from '../utils/routes';
import type { CourseDetailNavigationState } from '../utils/reviewNavigation';

import {
  getCourses,
  getPopularCourses,
  getPopularLocalCourses,
  getRecommendedCourses,
} from '../apis/courses.api';
import { deleteCourse, getCourseDetail } from '../apis/courses';
import type { CourseDetailResult } from '../apis/courses';
import type { NormalizedApiError } from '../apis/common';
import type {
  Course,
  GetCoursesParams,
  GetCoursesResponse,
  GetPopularCoursesParams,
  PopularLocalCourse,
  RecommendedCourse,
} from '../types/course.type';
import type { GetMyPostsResponse } from '../types/user.type';

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

export function usePopularLocalCourses() {
  return useQuery<PopularLocalCourse[], NormalizedApiError>({
    queryKey: ['popularLocalCourses'],
    queryFn: getPopularLocalCourses,
  });
}

export function useRecommendedCourses() {
  return useQuery<RecommendedCourse[], NormalizedApiError>({
    queryKey: ['recommendedCourses'],
    queryFn: getRecommendedCourses,
  });
}

export function useCourseDelete() {
  const [targetCourseId, setTargetCourseId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ['myPosts'] });

      const previousMyPosts = queryClient.getQueriesData<
        InfiniteData<GetMyPostsResponse>
      >({ queryKey: ['myPosts'] });

      queryClient.setQueriesData<InfiniteData<GetMyPostsResponse>>(
        { queryKey: ['myPosts'] },
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.filter(
                    (item) => item.course?.id !== courseId
                  ),
                })),
              }
            : data
      );

      return { previousMyPosts };
    },
    onError: (_, __, context) => {
      context?.previousMyPosts.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (_, courseId) => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      void queryClient.invalidateQueries({ queryKey: ['popularCourses'] });
      void queryClient.invalidateQueries({ queryKey: ['popularLocalCourses'] });
      void queryClient.invalidateQueries({ queryKey: ['recommendedCourses'] });
      queryClient.removeQueries({ queryKey: ['courseDetail', courseId] });
      removeRecentCourse(courseId);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    },
  });

  const closeDialog = () => setTargetCourseId(null);

  const confirmDelete = async () => {
    if (targetCourseId === null || deleteCourseMutation.isPending) return;

    try {
      await deleteCourseMutation.mutateAsync(targetCourseId);
      closeDialog();
      showToast('코스를 삭제했어요.');
    } catch (error) {
      closeDialog();
      showToast(getApiErrorMessage(error, '코스를 삭제하지 못했어요.'));
    }
  };

  return {
    requestDelete: setTargetCourseId,
    dialogProps: {
      isOpen: targetCourseId !== null,
      isPending: deleteCourseMutation.isPending,
      onCancel: closeDialog,
      onConfirm: () => void confirmDelete(),
    },
  };
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

  const courseDetailQuery = (courseId: number) => ({
    queryKey: ['courseDetail', courseId],
    queryFn: () => getCourseDetail(courseId),
    staleTime: DETAIL_STALE_TIME,
  });

  /**
   * 이동 전에 다른 조회를 함께 보내야 할 때 쓴다. 같은 캐시를 채우므로
   * 뒤이어 goToCourseDetail을 부르면 기다리지 않고 바로 이동한다.
   */
  const prefetchCourseDetail = (courseId: number) =>
    queryClient.prefetchQuery(courseDetailQuery(courseId));

  const goToCourseDetail = async (
    courseId: number,
    state?: CourseDetailNavigationState
  ) => {
    if (isResolvingCourse) {
      return;
    }

    setIsResolvingCourse(true);

    try {
      const course = await queryClient.fetchQuery(courseDetailQuery(courseId));

      navigate(buildCourseDetailPath(course.courseType, courseId), { state });
    } catch (error) {
      showToast(getApiErrorMessage(error, '코스를 열지 못했어요.'));
    } finally {
      setIsResolvingCourse(false);
    }
  };

  return { goToCourseDetail, prefetchCourseDetail, isResolvingCourse };
}
