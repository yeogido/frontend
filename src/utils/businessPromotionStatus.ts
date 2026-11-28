import type { BusinessInfoResponse } from '../types/business.type';

// react-query나 apiClient를 import하지 않는다. 홍보 여부 판단만 담아 Node
// 테스트 러너에서 그대로 검증한다.

/** 서버 응답 그대로의 모양. hasActivePromotion이 없는 이전 응답도 받는다. */
export type RawBusinessInfo = Omit<
  BusinessInfoResponse,
  'hasActivePromotion'
> & {
  hasActivePromotion?: boolean | null;
};

/** 응답에 홍보 여부가 없거나 null이면 홍보 중이 아닌 것으로 본다. */
export function normalizeBusinessInfo(
  business: RawBusinessInfo
): BusinessInfoResponse {
  return {
    ...business,
    hasActivePromotion: business.hasActivePromotion === true,
  };
}

/** 이미 홍보 중인 사업장인지. 홍보 중이면 새 홍보글을 등록할 수 없다. */
export function isBusinessPromoting(
  business: Pick<BusinessInfoResponse, 'hasActivePromotion'>
): boolean {
  return business.hasActivePromotion === true;
}

/** 인증한 사업장이 있고 전부 홍보 중이다. 사업장이 하나도 없으면 아니다. */
export function areAllBusinessesPromoting(
  businesses: readonly Pick<BusinessInfoResponse, 'hasActivePromotion'>[]
): boolean {
  return businesses.length > 0 && businesses.every(isBusinessPromoting);
}

/** 선택할 수 있는 사업장. 홍보 중이면 고를 수 없다. */
export function isBusinessSelectable(
  business: Pick<BusinessInfoResponse, 'hasActivePromotion'>
): boolean {
  return !isBusinessPromoting(business);
}
