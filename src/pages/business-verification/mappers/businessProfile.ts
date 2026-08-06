import type { BusinessInfoResponse } from '../../../types/business.type';
import type { BusinessProfile } from '../types';

// 응답의 businessNumber는 하이픈 없는 10자리다. 폼 입력과 같은 표기로 보여준다.
export function formatBusinessNumber(businessNumber: string) {
  const digits = businessNumber.replace(/\D/g, '');

  if (digits.length !== 10) {
    return businessNumber;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// verifiedAt은 타임존 오프셋이 없는 LocalDateTime('2026-07-26T15:30:00')이라
// new Date()로 파싱하면 로컬 타임존 해석 때문에 날짜가 밀릴 수 있다.
// 같은 도메인의 홍보글 매퍼와 동일하게 문자열을 그대로 자른다.
export function formatVerifiedAt(verifiedAt: string) {
  return verifiedAt.slice(0, 10).replace(/-/g, '.');
}

// 인증 직후 미리보기용. 목록 재조회가 아직 끝나지 않았거나 서버 인증 상태가
// APPROVED로 넘어가기 전이면 목록이 비어 있어서, 방금 제출한 값으로 한 칸을
// 채운다. businessInfoId는 아직 모르므로 목록 항목 key 용도로만 0을 쓴다.
export function toPreviewBusiness(
  profile: BusinessProfile
): BusinessInfoResponse {
  return {
    businessInfoId: 0,
    businessNumber: profile.registrationNumber,
    businessName: profile.businessName,
    businessAddress: profile.businessAddress,
    representativeName: profile.representativeName,
    verifiedAt: '',
  };
}

export function toBusinessProfile(
  business: BusinessInfoResponse
): BusinessProfile {
  return {
    businessName: business.businessName,
    businessAddress: business.businessAddress,
    representativeName: business.representativeName,
    registrationNumber: formatBusinessNumber(business.businessNumber),
    // 개업일자는 사업장 목록 응답에 없다. 인증 직후 미리보기에서만 방금
    // 제출한 폼 값으로 채워진다.
    openedAt: '',
  };
}
