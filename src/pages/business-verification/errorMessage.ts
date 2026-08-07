// 배럴(apis/common)이 아니라 apiError를 직접 가져온다. 배럴은 apiClient까지
// 끌어와 import.meta.env에 의존하는데, Node 테스트 러너에서는 그게 없다.
import {
  getApiErrorMessage,
  normalizeApiError,
} from '../../apis/common/apiError.ts';

export const VERIFY_ERROR_MESSAGE =
  '사업자 인증에 실패했어요. 입력한 정보를 다시 확인해 주세요.';

/**
 * 국세청 외부 API 장애로 실패한 경우.
 *
 * 간헐적으로 발생하고 사용자 입력과는 무관해서, 정보를 다시 확인하라고 하면
 * 고칠 수 없는 걸 붙잡게 된다. 서버 문구('국세청 외부 연동 중 오류가
 * 발생했습니다')도 원인을 내부 사정으로 설명할 뿐 다음 행동을 알려주지
 * 않으므로, 다시 시도하라고 안내한다.
 */
export const VERIFY_UNAVAILABLE_MESSAGE =
  '사업자 인증 서비스에 일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';

// 이 코드들은 사용자가 고칠 수 있는 문제가 아니라 프론트가 페이로드를 잘못
// 만든 경우다. 서버 문구('필수 입력값 누락', '전달한 지역 ID가 존재하지
// 않습니다')를 그대로 보여주면 사용자가 할 수 있는 게 없어 fallback을 쓴다.
const FALLBACK_ONLY_CODES = new Set(['COMMON4001', 'REGION4041']);

// 원인별 안내가 잘 되어 있어 서버 문구를 그대로 노출하는 코드들:
// BUSINESS_VERIFY4001(형식 오류), 4002(정보 불일치), 4041(폐업/미존재),
// 4091(이미 등록됨).
const UNAVAILABLE_CODE = 'BUSINESS_VERIFY5001';

export function getBusinessVerificationErrorMessage(error: unknown): string {
  const { code } = normalizeApiError(error);

  if (code === UNAVAILABLE_CODE) {
    return VERIFY_UNAVAILABLE_MESSAGE;
  }

  if (FALLBACK_ONLY_CODES.has(code)) {
    return VERIFY_ERROR_MESSAGE;
  }

  return getApiErrorMessage(error, VERIFY_ERROR_MESSAGE);
}
