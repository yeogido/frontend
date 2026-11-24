import {
  getApiErrorMessage,
  normalizeApiError,
} from '../../../apis/common/apiError.ts';
import type { FriendRelationStatus } from '../../../types/friend.type.ts';

/** ?qr= 값을 토큰으로 바꾼다. 없거나 공백이면 null이다. */
export function parseQrToken(value: string | null | undefined): string | null {
  const token = value?.trim();

  return token ? token : null;
}

export type QrScanErrorKind =
  'invalid' | 'self' | 'not-found-user' | 'already-friend' | 'failed';

export const QR_INVALID_MESSAGE =
  'QR이 만료됐거나 유효하지 않아요. 상대에게 새 QR을 요청해 주세요.';
export const QR_SELF_MESSAGE = '내 QR 코드예요.';
export const QR_USER_NOT_FOUND_MESSAGE = '존재하지 않는 사용자예요.';
export const QR_ALREADY_FRIEND_MESSAGE = '이미 친구예요.';
export const QR_LOAD_FAILURE_MESSAGE = 'QR 정보를 불러오지 못했어요.';
export const QR_ACCEPT_FAILURE_MESSAGE = '친구를 맺지 못했어요.';

interface QrScanFailure {
  kind: QrScanErrorKind;
  message: string;
}

// 팀 Notion 기준. FRIEND4044는 만료·무효·탈퇴한 QR을 한 코드로 준다. FRIEND4001은
// 요청 보내기에서는 "나에게 요청"이지만 여기서는 내 QR을 스캔한 경우다. 401은
// apiClient가 처리하므로 따로 나누지 않는다.
const KNOWN_FAILURES: Readonly<Record<string, QrScanFailure>> = {
  FRIEND4044: { kind: 'invalid', message: QR_INVALID_MESSAGE },
  FRIEND4001: { kind: 'self', message: QR_SELF_MESSAGE },
  USER4041: { kind: 'not-found-user', message: QR_USER_NOT_FOUND_MESSAGE },
  FRIEND4091: { kind: 'already-friend', message: QR_ALREADY_FRIEND_MESSAGE },
};

/** QR 조회·친구 맺기 실패를 화면 상태와 안내 문구로 옮긴다. */
export function getQrScanError(
  error: unknown,
  fallbackMessage = QR_LOAD_FAILURE_MESSAGE
): QrScanFailure {
  return (
    KNOWN_FAILURES[normalizeApiError(error).code] ?? {
      kind: 'failed',
      message: getApiErrorMessage(error, fallbackMessage),
    }
  );
}

export interface QrScanAction {
  kind: 'befriend' | 'already-friend';
  label: string;
}

/**
 * 관계 상태에 맞는 동작. QR로는 수락 없이 바로 친구가 되므로 친구가 아니면(NONE,
 * REQUESTED, RECEIVED) 모두 "친구 맺기"이고, 이미 친구면 프로필로 안내한다.
 */
export function getQrScanAction(
  relationStatus: FriendRelationStatus
): QrScanAction {
  return relationStatus === 'FRIEND'
    ? { kind: 'already-friend', label: '이미 친구예요' }
    : { kind: 'befriend', label: '친구 맺기' };
}
