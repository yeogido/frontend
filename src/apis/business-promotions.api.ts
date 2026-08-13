import { apiClient } from './common';

import type {
  BusinessPromotionCreateRequest,
  BusinessPromotionCreateResponse,
  BusinessPromotionDetailResponse,
  BusinessPromotionListParams,
  BusinessPromotionListResponse,
  BusinessPromotionUpdateRequest,
  BusinessPromotionUpdateResponse,
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

export async function createBusinessPromotion(
  payload: BusinessPromotionCreateRequest
): Promise<BusinessPromotionCreateResponse> {
  const { data } = await apiClient.post<BusinessPromotionCreateResponse>(
    '/business-promotions',
    payload
  );

  return data;
}

export async function updateBusinessPromotion(
  promotionId: number,
  payload: BusinessPromotionUpdateRequest
): Promise<BusinessPromotionUpdateResponse> {
  const { data } = await apiClient.patch<BusinessPromotionUpdateResponse>(
    `/business-promotions/${promotionId}`,
    payload
  );

  return data;
}

export async function deleteBusinessPromotion(
  promotionId: number
): Promise<void> {
  await apiClient.delete(`/business-promotions/${promotionId}`);
}
