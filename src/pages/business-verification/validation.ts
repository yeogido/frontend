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

export const BUSINESS_NUMBER_LENGTH = 10;

export const BUSINESS_NUMBER_HINT = '사업자등록번호 10자리를 모두 입력해 주세요';

// 입력 중에도 123-45-67890 형태를 유지한다. 숫자만 남긴 뒤 10자리를 넘으면
// 잘라내고 자리수에 맞춰 하이픈을 끼워 넣는다. 지우는 방향으로도 자연스럽게
// 동작한다 — '123-'에서 한 글자를 지우면 숫자가 3개라 '123'이 된다.
export function formatBusinessNumberInput(value: string) {
  const digits = toBusinessNumber(value).slice(0, BUSINESS_NUMBER_LENGTH);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// 입력이 비어 있으면 아직 안내할 게 없다. 뭔가 치기 시작했는데 10자리가
// 안 되면 그때 알려준다.
export function getBusinessNumberHint(value: string) {
  if (!value.trim() || isBusinessRegistrationNumber(value)) {
    return '';
  }

  return BUSINESS_NUMBER_HINT;
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
