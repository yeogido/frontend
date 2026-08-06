import type { BusinessProfile, BusinessVerificationForm } from '../types';

export function toBusinessProfile(
  verification: BusinessVerificationForm
): BusinessProfile {
  return {
    businessName: '인증된 사업장',
    businessAddress: verification.businessAddress,
    representativeName: verification.representativeName,
    registrationNumber: verification.registrationNumber,
    openedAt: verification.openedAt,
  };
}
