import { useState } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getApiErrorMessage, normalizeApiError } from '../apis/common';
import { useToast } from '../components/toast';
import { createPresignedUrl, uploadFileToPresignedUrl } from '../apis/files.api';
import {
  createCourseReview,
  deleteReview,
  getCourseReviews,
  getReviews,
  updateReview,
} from '../apis/reviews.api';
import { getMyPosts } from '../apis/users.api';
import { collectMyReviewIds } from '../utils/collectMyReviewIds';
import { useAuth } from './useAuth';
import type {
  CourseReviewImageRequest,
  CreateCourseReviewResponse,
  GetReviewsResponse,
  ReviewSort,
  UpdateReviewRequest,
  UpdateReviewResponse,
} from '../types/review.type';

const REVIEW_NOT_FOUND_CODE = 'REVIEW4041';

const isReviewNotFoundError = (error: unknown) => {
  const { code, status } = normalizeApiError(error);

  return code === REVIEW_NOT_FOUND_CODE || status === 404;
};

interface ReviewsPageParam {
  cursor?: number;
}

interface CreateCourseReviewParams {
  courseId: number;
  rating: number;
  content: string;
  photos: File[];
}

interface UpdateReviewParams {
  reviewId: number;
  request: UpdateReviewRequest;
}

const REVIEWS_PAGE_SIZE = 10;

/**
 * 선택한 사진을 presigned URL로 올리고 리뷰 요청에 넣을 이미지 목록을 만든다.
 * 여행 기록(useTravelRecords)과 동일한 절차이며, 순서 필드명만 리뷰 작성
 * API 스펙에 맞춰 order를 쓴다.
 */
const uploadReviewImages = async (photos: File[]) => {
  const images: CourseReviewImageRequest[] = [];

  for (const [index, photo] of photos.entries()) {
    const presignedUrl = await createPresignedUrl({
      fileName: photo.name,
      contentType: photo.type || 'application/octet-stream',
    });
    await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo);
    images.push({ imageKey: presignedUrl.objectKey, order: index + 1 });
  }

  return images;
};

export function useRecentReviews() {
  return useQuery({
    queryKey: ['recentReviews'],
    queryFn: () => getReviews({ sort: 'LATEST', size: 3 }),
  });
}

export function useReviews(sort: ReviewSort = 'LATEST') {
  return useInfiniteQuery<
    GetReviewsResponse,
    Error,
    InfiniteData<GetReviewsResponse, ReviewsPageParam>,
    [string, ReviewSort],
    ReviewsPageParam
  >({
    queryKey: ['reviews', sort],
    queryFn: ({ pageParam }) =>
      getReviews({ sort, size: REVIEWS_PAGE_SIZE, cursor: pageParam.cursor }),
    initialPageParam: {},
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.cursorId
        ? { cursor: lastPage.cursorId }
        : undefined,
  });
}

const MY_POSTS_PAGE_SIZE = 50;

const EMPTY_REVIEW_IDS: ReadonlySet<number> = new Set();

/**
 * 내가 쓴 리뷰의 ID 집합.
 *
 * 리뷰 조회 응답에 작성자 식별자가 없어 본인 여부를 알 수 없다. 대신 내
 * 게시물 목록에서 리뷰만 받아 ID로 대조한다. 백엔드가 isMine(또는
 * author.userId)을 내려주기 시작하면 이 훅째로 걷어낼 수 있다.
 */
export function useMyReviewIds() {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ['myReviewIds'],
    queryFn: () =>
      collectMyReviewIds((cursorId) =>
        getMyPosts({
          category: 'REVIEW',
          size: MY_POSTS_PAGE_SIZE,
          cursorId,
        }),
      ),
    enabled: isAuthenticated,
    // 매 화면 진입마다 전 페이지를 다시 훑지 않도록 잠시 재사용한다.
    staleTime: 1000 * 60,
  });

  return data ?? EMPTY_REVIEW_IDS;
}

export function useCourseReviews(courseId: number | undefined) {
  return useQuery({
    queryKey: ['courseReviews', courseId],
    queryFn: () => getCourseReviews(courseId as number),
    enabled: typeof courseId === 'number' && courseId > 0,
  });
}

export function useCreateCourseReview() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateCourseReviewResponse,
    Error,
    CreateCourseReviewParams
  >({
    mutationFn: async ({ courseId, rating, content, photos }) =>
      createCourseReview(courseId, {
        rating,
        content,
        images: await uploadReviewImages(photos),
      }),
    onSuccess: (_, { courseId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['recentReviews'] });
      void queryClient.invalidateQueries({ queryKey: ['myReviewIds'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation<UpdateReviewResponse, Error, UpdateReviewParams>({
    mutationFn: ({ reviewId, request }) => updateReview(reviewId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courseReviews'] });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['recentReviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (reviewId) => {
      try {
        await deleteReview(reviewId);
      } catch (error) {
        // 이미 없는 리뷰면 사용자가 원한 상태에 도달한 것이다. 실패로
        // 처리하면 목록에 남아 재시도해도 계속 404가 나서 빠져나갈 수
        // 없다(여행 기록 삭제와 같은 처리).
        if (!isReviewNotFoundError(error)) {
          throw error;
        }
      }
    },
    onSuccess: (_, reviewId) => {
      // invalidateQueries의 재조회를 기다리는 동안 목록이 삭제된 리뷰를
      // 그대로 한 번 더 그리는 구간이 생긴다. 캐시에서 먼저 걷어낸다.
      queryClient.setQueriesData<
        InfiniteData<GetReviewsResponse, ReviewsPageParam>
      >({ queryKey: ['reviews'] }, (data) => {
        if (!data) {
          return data;
        }

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.reviewId !== reviewId),
          })),
        };
      });
      // 홈은 무한 쿼리가 아니라 일반 쿼리로 담겨 있어 위 updater에 걸리지
      // 않는다. 키를 ['reviews'] 아래로 합치면 위 updater가 pages 없는
      // 데이터에 걸려 터지므로, 키는 분리한 채로 여기서 따로 걷어낸다.
      queryClient.setQueriesData<GetReviewsResponse>(
        { queryKey: ['recentReviews'] },
        (data) =>
          data
            ? {
                ...data,
                items: data.items.filter(
                  (item) => item.reviewId !== reviewId,
                ),
              }
            : data,
      );
      void queryClient.invalidateQueries({ queryKey: ['courseReviews'] });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['recentReviews'] });
      void queryClient.invalidateQueries({ queryKey: ['myReviewIds'] });
    },
  });
}

/**
 * 후기 삭제 확인 흐름.
 *
 * 후기 카드는 홈/코스 상세/후기 전체보기 세 곳에 같은 방식으로 놓이므로,
 * 확인 다이얼로그 상태와 삭제 처리를 한곳에 모은다. 화면은 반환값을
 * ConfirmDialog에 그대로 넘기면 된다.
 */
export function useReviewDelete() {
  const [targetReviewId, setTargetReviewId] = useState<number | null>(null);
  const { showToast } = useToast();
  const deleteReview = useDeleteReview();

  const closeDialog = () => setTargetReviewId(null);

  const confirmDelete = async () => {
    if (targetReviewId === null || deleteReview.isPending) {
      return;
    }

    try {
      await deleteReview.mutateAsync(targetReviewId);
      closeDialog();
      showToast('후기를 삭제했어요.');
    } catch (error) {
      closeDialog();
      showToast(getApiErrorMessage(error, '후기를 삭제하지 못했어요.'));
    }
  };

  return {
    isDeleteDialogOpen: targetReviewId !== null,
    isDeletePending: deleteReview.isPending,
    requestDelete: setTargetReviewId,
    cancelDelete: closeDialog,
    confirmDelete: () => void confirmDelete(),
  };
}

export const getReviewsFromPages = (
  pages: GetReviewsResponse[] | undefined,
) => pages?.flatMap((page) => page.items) ?? [];
