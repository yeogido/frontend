import { apiClient } from './common';

import type {
  BusinessPromotionDetailResponse,
  BusinessPromotionListParams,
  BusinessPromotionListResponse,
} from '../types/businessPromotion.type';

export async function getBusinessPromotions(
  params: BusinessPromotionListParams = {}
): Promise<BusinessPromotionListResponse> {
  // apiClient's response interceptor already unwraps the envelope and
  // normalizes rejected errors, so no local try/catch is needed here.
  const { data } = await apiClient.get<BusinessPromotionListResponse>(
    '/business-promotions',
    { params }
  );

  return data;
}

export async function getBusinessPromotionDetail(
  promotionId: number
): Promise<BusinessPromotionDetailResponse> {
  const { data } = await apiClient.get<BusinessPromotionDetailResponse>(
    `/business-promotions/${promotionId}`
  );

  return data;
}
