// 배럴(apis/common)이 아니라 apiError를 직접 가져온다. 배럴은 apiClient까지
// 끌어와 import.meta.env에 의존하는데, Node 테스트 러너에서는 그게 없다.
import {
  getApiErrorMessage,
  normalizeApiError,
} from '../../apis/common/apiError.ts';

export const VERIFY_ERROR_MESSAGE =
  '사업자 인증에 실패했어요. 입력한 정보를 다시 확인해 주세요.';

// 이 코드들은 사용자가 고칠 수 있는 문제가 아니라 프론트가 페이로드를 잘못
// 만든 경우다. 서버 문구('필수 입력값 누락', '전달한 지역 ID가 존재하지
// 않습니다')를 그대로 보여주면 사용자가 할 수 있는 게 없어 fallback을 쓴다.
// 나머지(BUSINESS_VERIFY4001/4002/4041/4091/5001)는 원인별 안내가 잘 되어
// 있어 서버 문구를 그대로 노출한다.
const FALLBACK_ONLY_CODES = new Set(['COMMON4001', 'REGION4041']);

export function getBusinessVerificationErrorMessage(error: unknown): string {
  const { code } = normalizeApiError(error);

  if (FALLBACK_ONLY_CODES.has(code)) {
    return VERIFY_ERROR_MESSAGE;
  }

  return getApiErrorMessage(error, VERIFY_ERROR_MESSAGE);
}
