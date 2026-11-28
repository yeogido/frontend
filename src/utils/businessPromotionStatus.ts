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

/** 사업장 목록을 받아 온 상태. 정상이면 'ready'. */
export type BusinessListStatus = 'loading' | 'error' | 'ready';

/**
 * 고른 사업장을 지금 목록과 맞춰 본 결과.
 * - none: 고른 사업장이 없다.
 * - unverified: 목록이 로딩 중이거나 에러라 최신 상태를 확인하지 못했다. 선택은
 *   그대로 두되 넘어가지는 못한다.
 * - selectable: 목록에 있고 홍보 중이 아니라 넘어갈 수 있다.
 * - release: 목록에 없거나 홍보 중이라 선택을 해제해야 한다.
 */
export type SelectedBusinessCheck =
  'none' | 'unverified' | 'selectable' | 'release';

interface CheckSelectedBusinessParams {
  readonly selectedBusinessId: number | null;
  readonly listStatus: BusinessListStatus;
  readonly businesses: readonly Pick<
    BusinessInfoResponse,
    'businessInfoId' | 'hasActivePromotion'
  >[];
}

/**
 * 모바일과 PC가 같은 정책으로 고른 사업장을 다룬다. 목록이 정상일 때만 판단하고,
 * 로딩 중이거나 에러면 해제하지 않고 "확인 못 함"으로 둔다.
 */
export function checkSelectedBusiness({
  selectedBusinessId,
  listStatus,
  businesses,
}: CheckSelectedBusinessParams): SelectedBusinessCheck {
  if (selectedBusinessId === null) return 'none';
  if (listStatus !== 'ready') return 'unverified';

  const latest = businesses.find(
    (business) => business.businessInfoId === selectedBusinessId
  );

  return latest !== undefined && isBusinessSelectable(latest)
    ? 'selectable'
    : 'release';
}

/** 선택할 수 있는 사업장. 홍보 중이면 고를 수 없다. */
export function isBusinessSelectable(
  business: Pick<BusinessInfoResponse, 'hasActivePromotion'>
): boolean {
  return !isBusinessPromoting(business);
}
