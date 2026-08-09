import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getApiErrorMessage } from '../apis/common';
import { useToast } from '../components/toast';
import { collectMyCourseIds } from '../utils/collectMyCourseIds';
import { removeRecentCourse } from '../utils/recentCourses';
import { buildCourseDetailPath } from '../utils/routes';
import { useAuth } from './useAuth';

import {
  getCourses,
  getPopularCourses,
  getRecommendedCourses,
} from '../apis/courses.api';
import { deleteCourse, getCourseDetail } from '../apis/courses';
import type { CourseDetailResult } from '../apis/courses';
import type { NormalizedApiError } from '../apis/common';
import { getMyPosts } from '../apis/users.api';
import type {
  Course,
  GetCoursesParams,
  GetCoursesResponse,
  GetPopularCoursesParams,
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

export function useRecommendedCourses() {
  return useQuery<RecommendedCourse[], NormalizedApiError>({
    queryKey: ['recommendedCourses'],
    queryFn: getRecommendedCourses,
  });
}

const MY_POSTS_PAGE_SIZE = 50;

const EMPTY_COURSE_IDS: ReadonlySet<number> = new Set();

/**
 * 내가 쓴 코스의 ID 집합 — useMyReviewIds와 같은 이유(작성자 식별자가
 * 응답에 없다)로 내 게시물 목록에서 코스만 받아 ID로 대조한다.
 */
export function useMyCourseIds() {
  const { isAuthenticated, userId } = useAuth();

  const { data } = useQuery({
    // userId를 키에 넣어야, 로그아웃 후 다른 계정으로 로그인해도 이전
    // 세션의 캐시를 그대로 재사용하지 않는다.
    queryKey: ['myCourseIds', userId],
    queryFn: () =>
      collectMyCourseIds((cursorId) =>
        getMyPosts({
          category: 'COURSE',
          size: MY_POSTS_PAGE_SIZE,
          cursorId,
        })
      ),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });

  // 비로그인 상태면 쿼리가 비활성화될 뿐 이전에 캐시된 data는 그대로
  // 남아있을 수 있어, 여기서 한 번 더 걸러 노출되지 않게 한다.
  return isAuthenticated ? (data ?? EMPTY_COURSE_IDS) : EMPTY_COURSE_IDS;
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
