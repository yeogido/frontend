import { useState } from 'react';
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  deleteBusinessPromotion,
  getBusinessPromotions,
} from '../apis/business-promotions.api';
import { getApiErrorMessage, normalizeApiError } from '../apis/common';
import { useToast } from '../components/toast';
import type {
  BusinessPromotionListParams,
  BusinessPromotionListResponse,
} from '../types/businessPromotion.type';
import type { GetMyPostsResponse } from '../types/user.type';

interface BusinessPromotionsPageParam {
  cursorValue?: string;
  cursorId?: number;
}

interface UseBusinessPromotionsOptions {
  enabled?: boolean;
}

export function useBusinessPromotions(
  params: BusinessPromotionListParams = {},
  options: UseBusinessPromotionsOptions = {}
) {
  return useInfiniteQuery<
    BusinessPromotionListResponse,
    Error,
    InfiniteData<BusinessPromotionListResponse, BusinessPromotionsPageParam>,
    [string, BusinessPromotionListParams],
    BusinessPromotionsPageParam
  >({
    queryKey: ['businessPromotions', params],
    queryFn: ({ pageParam }) =>
      getBusinessPromotions({
        ...params,
        cursorValue: pageParam.cursorValue,
        cursorId: pageParam.cursorId,
      }),
    initialPageParam: {},
    enabled: options.enabled,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;

      const cursorValue = lastPage.cursorValue ?? undefined;
      const cursorId = lastPage.cursorId ?? undefined;

      // 커서 쌍이 온전하지 않으면(하나라도 없으면) 다음 페이지를 안전하게
      // 요청할 수 없으므로 페이지네이션을 종료한다. cursorValue/cursorId는
      // 함께 있어야 의미가 있는 keyset 커서 쌍이다 (실제 응답 예:
      // cursorValue: "0|2026-08-03T00:16:02.077790", cursorId: 3).
      if (cursorValue === undefined || cursorId === undefined) {
        return undefined;
      }

      return { cursorValue, cursorId };
    },
  });
}

const PROMOTION_NOT_FOUND_CODE = 'BUSINESS_PROMOTION4041';

const isPromotionNotFoundError = (error: unknown) =>
  normalizeApiError(error).code === PROMOTION_NOT_FOUND_CODE;

interface MyPostsSnapshot {
  previousMyPosts: [
    readonly unknown[],
    InfiniteData<GetMyPostsResponse> | undefined,
  ][];
}

/**
 * 홍보글 삭제. 소프트 삭제(status=DELETED)라 성공하면 목록 조회에서 바로
 * 빠지지만, 재조회를 기다리지 않고 낙관적으로 먼저 지운다(코스 삭제와
 * 동일한 처리, useCourses.ts의 useCourseDelete 참고).
 *
 * 이미 삭제된 글(BUSINESS_PROMOTION4041)은 사용자가 원한 상태에 이미
 * 도달한 것이므로 롤백하지 않고 그대로 둔다 — 다만 후기/코스 삭제와 달리
 * 서로 다른 안내 문구를 보여줘야 해서(요구사항: 403/404 각각 한국어 메시지)
 * mutationFn에서 삼키지 않고 confirmDelete에서 코드별로 분기한다.
 */
function useDeleteBusinessPromotion() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number, MyPostsSnapshot>({
    mutationFn: deleteBusinessPromotion,
    onMutate: async (promotionId) => {
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
                    (item) => item.promotion?.promotionId !== promotionId
                  ),
                })),
              }
            : data
      );

      return { previousMyPosts };
    },
    onError: (error, _, context) => {
      if (isPromotionNotFoundError(error)) return;

      context?.previousMyPosts.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (_, promotionId) => {
      void queryClient.invalidateQueries({ queryKey: ['businessPromotions'] });
      queryClient.removeQueries({ queryKey: ['businessPromotion', promotionId] });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    },
  });
}

/**
 * 홍보글 삭제 확인 흐름. useCourseDelete/useReviewDelete와 같은 모양으로,
 * 화면은 requestDelete만 연결하고 dialogProps를 ConfirmDialog에 그대로
 * 펼치면 된다.
 */
export function useBusinessPromotionDelete() {
  const [targetPromotionId, setTargetPromotionId] = useState<number | null>(
    null
  );
  const { showToast } = useToast();
  const deleteMutation = useDeleteBusinessPromotion();

  const closeDialog = () => setTargetPromotionId(null);

  const confirmDelete = async () => {
    if (targetPromotionId === null || deleteMutation.isPending) return;

    try {
      await deleteMutation.mutateAsync(targetPromotionId);
      closeDialog();
      showToast('홍보글을 삭제했어요.');
    } catch (error) {
      closeDialog();

      if (isPromotionNotFoundError(error)) {
        showToast('이미 삭제되었거나 존재하지 않는 게시물이에요.');
        return;
      }

      showToast(getApiErrorMessage(error, '홍보글을 삭제하지 못했어요.'));
    }
  };

  return {
    requestDelete: setTargetPromotionId,
    dialogProps: {
      isOpen: targetPromotionId !== null,
      isPending: deleteMutation.isPending,
      onCancel: closeDialog,
      onConfirm: () => void confirmDelete(),
    },
  };
}
