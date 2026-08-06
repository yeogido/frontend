import type { PlaceItem } from '../local-recommendation/place-selection/types';

interface BusinessVerificationValues {
  readonly certificate: File | null;
  readonly place: PlaceItem | null;
  readonly businessName: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
}

export function isBusinessRegistrationNumber(value: string) {
  return /^\d{3}-?\d{2}-?\d{5}$/.test(value.trim());
}

// 요청 스펙은 ^\d{10}$이라 하이픈을 허용하지 않는다. 입력은 '123-45-67890'
// 형태를 받아주고, 보낼 때 숫자만 남긴다.
export function toBusinessNumber(value: string) {
  return value.replace(/\D/g, '');
}

// place는 요청 필수값이고 카카오 검색으로만 얻을 수 있어, 주소를 직접 타이핑한
// 상태로는 제출할 수 없다.
export function isBusinessVerificationSubmittable({
  certificate,
  place,
  businessName,
  representativeName,
  registrationNumber,
  openedAt,
}: BusinessVerificationValues) {
  return Boolean(
    certificate &&
      place &&
      businessName.trim() &&
      representativeName.trim() &&
      isBusinessRegistrationNumber(registrationNumber) &&
      openedAt
  );
}
