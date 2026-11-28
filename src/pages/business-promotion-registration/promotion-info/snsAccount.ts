// 폼 라이브러리를 import하지 않는다. SNS 주소 입력 판단과 변환만 담아 Node 테스트
// 러너에서 그대로 검증한다.

export const SNS_ACCOUNT_ERROR_MESSAGE =
  'SNS 주소를 링크 형태로 입력해 주세요. (예: instagram.com/아이디)';

const SCHEME_PATTERN = /^https?:\/\//i;
// 주소(스킴 제외)의 모양. 점이 있는 호스트(양끝이 점이 아니고 @와 공백이 없음)로
// 시작하고, 뒤에 경로나 쿼리가 붙을 수 있다.
const ADDRESS_PATTERN = /^[^\s/?#@.]+(?:\.[^\s/?#@.]+)+(?:[/?#]\S*)?$/;

/** 비어 있으면(공백만 있어도) 선택 항목이라 괜찮다. 아니면 주소 모양이어야 한다. */
export function isValidSnsAccountInput(input: string): boolean {
  const trimmed = input.trim();

  if (trimmed === '') return true;

  return ADDRESS_PATTERN.test(trimmed.replace(SCHEME_PATTERN, ''));
}

/**
 * 서버에 보낼 SNS 주소. 앞뒤 공백을 지우고 http:// 또는 https://(대소문자 무관)가
 * 없으면 https://를 붙인다. 비어 있으면 undefined라서 필드를 아예 보내지 않는다.
 * 입력이 주소 모양이 아닌 경우의 처리는 isValidSnsAccountInput이 먼저 막는다.
 */
export function normalizeSnsAccount(input: string): string | undefined {
  const trimmed = input.trim();

  if (trimmed === '') return undefined;

  return SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
}
