import {
  getApiErrorMessage,
  normalizeApiError,
} from '../../../apis/common/apiError.ts';

// 팀 Notion 기준 친구 요청 보내기 에러 코드.
export type SendRequestOutcome =
  | 'ALREADY_REQUESTED'
  | 'ALREADY_FRIEND'
  | 'ALREADY_RECEIVED'
  | 'NOT_FOUND'
  | 'SELF'
  | 'FAILED';

const OUTCOMES: Readonly<
  Record<string, { outcome: SendRequestOutcome; message: string }>
> = {
  FRIEND4092: {
    outcome: 'ALREADY_REQUESTED',
    message: '이미 친구 요청을 보냈어요.',
  },
  FRIEND4091: { outcome: 'ALREADY_FRIEND', message: '이미 친구예요.' },
  FRIEND4093: {
    outcome: 'ALREADY_RECEIVED',
    message: '상대방이 이미 친구 요청을 보냈어요. 수락해 주세요.',
  },
  FRIEND4041: { outcome: 'NOT_FOUND', message: '존재하지 않는 사용자예요.' },
  FRIEND4001: {
    outcome: 'SELF',
    message: '나에게는 친구 요청을 보낼 수 없어요.',
  },
};

export const SEND_REQUEST_FAILURE_MESSAGE = '친구 요청에 실패했어요.';

interface SendRequestFailure {
  outcome: SendRequestOutcome;
  message: string;
}

/**
 * 친구 요청 보내기 실패를 분류와 안내 문구로 옮긴다. 분류는 검색 결과를 서버
 * 상태에 맞추는 방법을 정하는 데 쓴다.
 */
export function getSendRequestOutcome(error: unknown): SendRequestFailure {
  const known = OUTCOMES[normalizeApiError(error).code];

  return (
    known ?? {
      outcome: 'FAILED',
      message: getApiErrorMessage(error, SEND_REQUEST_FAILURE_MESSAGE),
    }
  );
}
