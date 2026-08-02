import {
  type InfiniteData,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { getBusinessPromotions } from '../apis/business-promotions.api';
import type {
  BusinessPromotionListParams,
  BusinessPromotionListResponse,
} from '../types/businessPromotion.type';

interface BusinessPromotionsPageParam {
  cursorValue?: string;
  cursorId?: number;
}

export function useBusinessPromotions(
  params: BusinessPromotionListParams = {}
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
    getNextPageParam: (lastPage) =>
      lastPage.hasNext
        ? {
            cursorValue: lastPage.cursorValue ?? undefined,
            cursorId: lastPage.cursorId ?? undefined,
          }
        : undefined,
  });
}
