import { useQuery } from '@tanstack/react-query';

import { getBusinessPromotionDetail } from '../apis/business-promotions.api';

export function useBusinessPromotionDetail(promotionId: number) {
  return useQuery({
    queryKey: ['businessPromotion', promotionId],
    queryFn: () => getBusinessPromotionDetail(promotionId),
    enabled: Number.isInteger(promotionId) && promotionId > 0,
  });
}
