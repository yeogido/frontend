import { useState } from 'react';
import {
  type InfiniteData,
  type QueryKey,
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
import type {
  CourseReviewImageRequest,
  CreateCourseReviewResponse,
  GetCourseReviewsResponse,
  GetReviewsResponse,
  ReviewImageRequest,
  ReviewSort,
  UpdateReviewRequest,
  UpdateReviewResponse,
} from '../types/review.type';
import type { GetMyPostsResponse } from '../types/user.type';

const REVIEW_NOT_FOUND_CODE = 'REVIEW4041';
const COURSE_NOT_FOUND_CODE = 'COURSE4041';

/**
 * 삭제하려는 리뷰가 이미 없는 경우. 여기는 code 없는 404까지 넓게 받는다.
 * 넓게 잡아서 틀리더라도 "목록에서 사라진다"는 사용자가 원한 결과에
 * 도달하기 때문이다(여행 기록 삭제와 같은 처리).
 */
const isReviewNotFoundError = (error: unknown) => {
  const { code, status } = normalizeApiError(error);

  return code === REVIEW_NOT_FOUND_CODE || status === 404;
};

/**
 * 코스가 없거나 삭제된 경우. 후기를 못 불러온 것과 원인이 달라서, 화면이
 * "일시적인 조회 실패"로 안내하지 않도록 구분한다.
 *
 * 삭제 판정과 달리 status는 보지 않고 코스 코드만 본다. 본문에 code가 없는
 * 404는 normalizeApiError가 HTTP_404로 돌려주는데, 이건 배포 중이거나 경로가
 * 틀렸을 때도 나온다. 그것까지 "삭제된 코스"로 단정하면 일시적 장애인데도
 * 코스가 사라졌다고 안내하고 후기 작성 버튼까지 감춰버린다.
 */
export const isCourseNotFoundError = (error: unknown) =>
  normalizeApiError(error).code === COURSE_NOT_FOUND_CODE;

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

interface MyPostsSnapshot {
  previousMyPosts: [QueryKey, InfiniteData<GetMyPostsResponse> | undefined][];
}

const REVIEWS_PAGE_SIZE = 10;

/**
 * 선택한 사진을 presigned URL로 올리고 리뷰 요청에 넣을 이미지 목록을 만든다.
 * 여행 기록(useTravelRecords)과 동일한 절차이며, 순서 필드명만 리뷰 작성
 * API 스펙에 맞춰 order를 쓴다.
 */
const uploadPhoto = async (photo: File) => {
  const presignedUrl = await createPresignedUrl({
    fileName: photo.name,
    contentType: photo.type || 'application/octet-stream',
  });
  await uploadFileToPresignedUrl(presignedUrl.uploadUrl, photo);

  return presignedUrl.objectKey;
};

const uploadReviewImages = async (photos: File[]) => {
  const images: CourseReviewImageRequest[] = [];

  for (const [index, photo] of photos.entries()) {
    images.push({ imageKey: await uploadPhoto(photo), order: index + 1 });
  }

  return images;
};

/**
 * 홈 후기 섹션이 쓰는 최근 후기.
 *
 * 홈은 사진이 있는 후기만 3장 보여준다. 사진은 선택이라 걸러내면 3장이 안 될
 * 수 있어, 화면에 그릴 수보다 넉넉히 받아 둔다.
 */
const RECENT_REVIEWS_FETCH_SIZE = 20;

export function useRecentReviews() {
  return useQuery({
    queryKey: ['recentReviews'],
    queryFn: () =>
      getReviews({ sort: 'LATEST', size: RECENT_REVIEWS_FETCH_SIZE }),
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

/**
 * 코스 상세에 끼워 넣는 미리보기. 첫 페이지만 본다.
 *
 * 화면에는 사진 있는 후기 4개만 그리는데, 사진은 선택이라 걸러내면 4개가 안
 * 될 수 있어 넉넉히 받아 둔다.
 */
const COURSE_REVIEW_PREVIEW_SIZE = 20;

const COURSE_REVIEWS_PAGE_SIZE = 10;

const isValidCourseId = (courseId: number | undefined) =>
  typeof courseId === 'number' && courseId > 0;

export function useCourseReviewPreviews(courseId: number | undefined) {
  return useQuery({
    queryKey: ['courseReviews', courseId, 'preview'],
    queryFn: () =>
      getCourseReviews(courseId as number, {
        size: COURSE_REVIEW_PREVIEW_SIZE,
        sort: 'LATEST',
      }),
    enabled: isValidCourseId(courseId),
  });
}

interface CourseReviewsPageParam {
  cursorValue?: string;
  cursorId?: number;
}

export function useCourseReviews(
  courseId: number | undefined,
  sort: ReviewSort = 'LATEST',
) {
  return useInfiniteQuery<
    GetCourseReviewsResponse,
    Error,
    InfiniteData<GetCourseReviewsResponse, CourseReviewsPageParam>,
    [string, number | undefined, ReviewSort],
    CourseReviewsPageParam
  >({
    queryKey: ['courseReviews', courseId, sort],
    queryFn: ({ pageParam }) =>
      getCourseReviews(courseId as number, {
        ...pageParam,
        size: COURSE_REVIEWS_PAGE_SIZE,
        sort,
      }),
    initialPageParam: {},
    // cursorValue와 cursorId는 반드시 함께 보내야 한다. 하나만 가면 서버가
    // 400(COMMON4001)으로 처리하므로, 둘 다 온 경우에만 다음 페이지를 잇는다.
    getNextPageParam: (lastPage) =>
      lastPage.hasNext &&
      lastPage.cursorId !== null &&
      lastPage.cursorValue !== null
        ? {
            // LATEST는 일시, RATING은 별점이 실려 오므로 문자열로 맞춰 보낸다.
            cursorValue: String(lastPage.cursorValue),
            cursorId: lastPage.cursorId,
          }
        : undefined,
    enabled: isValidCourseId(courseId),
  });
}

export const getCourseReviewsFromPages = (
  pages: GetCourseReviewsResponse[] | undefined,
) => pages?.flatMap((page) => page.items) ?? [];

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
      void queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    },
  });
}

/**
 * 후기 수정. useReviewEdit이 감싸서 쓴다.
 *
 * 두 목록 응답(GET /reviews, GET /courses/{id}/reviews)이 모두 imageKey를
 * 내려주므로, 후기가 보이는 네 화면(홈·최근 후기·코스 상세·후기 전체보기)
 * 전부에서 수정에 들어갈 수 있다.
 */
function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation<UpdateReviewResponse, Error, UpdateReviewParams>({
    mutationFn: ({ reviewId, request }) => updateReview(reviewId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courseReviews'] });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['recentReviews'] });
      void queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    },
  });
}

function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, MyPostsSnapshot>({
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
    onMutate: async (reviewId) => {
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
                    (item) => item.review?.reviewId !== reviewId,
                  ),
                })),
              }
            : data,
      );

      return { previousMyPosts };
    },
    onError: (_, __, context) => {
      context?.previousMyPosts.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
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
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    },
  });
}

/**
 * 후기 삭제 확인 흐름.
 *
 * 후기 카드는 네 화면에 같은 방식으로 놓이므로 확인 다이얼로그 상태와 삭제
 * 처리를 한곳에 모은다. 화면은 requestDelete만 연결하고 dialogProps를
 * ReviewDeleteDialog에 그대로 펼치면 된다.
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
    requestDelete: setTargetReviewId,
    dialogProps: {
      isOpen: targetReviewId !== null,
      isPending: deleteReview.isPending,
      onCancel: closeDialog,
      onConfirm: () => void confirmDelete(),
    },
  };
}

export interface EditableReview {
  id: number;
  content: string;
  rating?: number;
  /** 유지 여부를 고를 기존 사진. imageKey가 있어야 PATCH에 다시 실을 수 있다. */
  editableImages: { imageKey: string; imageUrl: string }[];
  /**
   * 기존 사진 목록을 못 구한 경우 false. 그때는 사진 편집을 막고 별점·내용만
   * 고치게 한다. 빈 목록을 "사진 없음"으로 오해해 그대로 저장하면, images가
   * 전체 교체라 서버의 사진이 모두 지워진다.
   */
  canEditPhotos?: boolean;
}

export interface ReviewEditSubmission {
  rating: number;
  content: string;
  /**
   * 화면에 보이는 순서 그대로. 기존 사진은 imageKey, 새로 고른 사진은 File.
   *
   * 사진을 하나도 건드리지 않았으면 undefined다. 그때는 요청에서 images를
   * 빼서 서버가 기존 이미지를 그대로 두게 한다(명세상 생략 = 유지). 같은
   * 목록을 다시 보내면 서버가 지웠다 넣는 일을 헛하게 된다.
   */
  photos?: ({ imageKey: string } | { file: File })[];
}

/**
 * 후기 수정 흐름.
 *
 * 새로 고른 사진만 업로드하고, 유지하는 사진은 받아 둔 imageKey를 그대로
 * 돌려보낸다. images는 전체 교체 규칙이라 유지분까지 함께 실어야 한다.
 * 순서는 1부터 연속이어야 한다(REVIEW4002).
 */
export function useReviewEdit() {
  const [editingReview, setEditingReview] = useState<EditableReview | null>(
    null,
  );
  const { showToast } = useToast();
  const updateReviewMutation = useUpdateReview();

  const closeEditor = () => setEditingReview(null);

  const submitEdit = async ({
    rating,
    content,
    photos,
  }: ReviewEditSubmission) => {
    if (!editingReview || updateReviewMutation.isPending) {
      return;
    }

    try {
      let images: ReviewImageRequest[] | undefined;

      if (photos) {
        images = [];

        for (const [index, photo] of photos.entries()) {
          const imageKey =
            'imageKey' in photo ? photo.imageKey : await uploadPhoto(photo.file);

          images.push({ imageKey, imageOrder: index + 1 });
        }
      }

      await updateReviewMutation.mutateAsync({
        reviewId: editingReview.id,
        request: { rating, content, ...(images ? { images } : {}) },
      });
      closeEditor();
      showToast('후기를 수정했어요.');
    } catch (error) {
      showToast(getApiErrorMessage(error, '후기를 수정하지 못했어요.'));
    }
  };

  return {
    requestEdit: setEditingReview,
    editorProps: {
      review: editingReview ?? undefined,
      isPending: updateReviewMutation.isPending,
      onClose: closeEditor,
      onSubmit: (submission: ReviewEditSubmission) => void submitEdit(submission),
    },
  };
}

/**
 * 길게 눌러 여는 후기 상세 모달의 열림 상태.
 *
 * 네 화면이 각자 다른 목록을 그리지만 "누른 후기 하나를 골라 띄운다"는 흐름은
 * 같아서, id 보관과 조회를 여기로 모은다.
 */
export function useReviewDetailModal<Review extends { id: number }>(
  reviews: readonly Review[],
) {
  const [openedReviewId, setOpenedReviewId] = useState<number | null>(null);

  return {
    openedReview: reviews.find((review) => review.id === openedReviewId),
    openReview: setOpenedReviewId,
    closeReview: () => setOpenedReviewId(null),
  };
}

export const getReviewsFromPages = (
  pages: GetReviewsResponse[] | undefined,
) => pages?.flatMap((page) => page.items) ?? [];
