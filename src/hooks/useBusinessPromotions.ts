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
