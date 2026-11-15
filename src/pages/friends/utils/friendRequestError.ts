import {
  getApiErrorMessage,
  normalizeApiError,
} from '../../../apis/common/apiError.ts';

// 팀 Notion 기준 에러 코드. 이미 처리된 요청(FRIEND4094)과 없는 요청
// (FRIEND4042, 요청자가 탈퇴·비활성이 된 경우 포함)은 다시 눌러도 같은 결과라
// 사용자에게는 "이미 처리됨"으로 알린다. FRIEND4031(받은 사람만 수락·거절),
// FRIEND4032(보낸 사람만 취소), COMMON4002는 일반 실패로 둔다.
const ALREADY_HANDLED_CODES: ReadonlySet<string> = new Set([
  'FRIEND4094',
  'FRIEND4042',
]);

export const ALREADY_HANDLED_MESSAGE = '이미 처리된 요청이에요.';

interface FriendRequestFailure {
  /** true면 화면의 해당 행은 이미 서버에 없는 요청이다. */
  isAlreadyHandled: boolean;
  message: string;
}

/** 수락·삭제·취소 실패를 안내 문구와, 이미 처리된 요청인지로 옮긴다. */
export function getFriendRequestFailure(
  error: unknown,
  fallbackMessage: string
): FriendRequestFailure {
  const isAlreadyHandled = ALREADY_HANDLED_CODES.has(
    normalizeApiError(error).code
  );

  return {
    isAlreadyHandled,
    message: isAlreadyHandled
      ? ALREADY_HANDLED_MESSAGE
      : getApiErrorMessage(error, fallbackMessage),
  };
}
