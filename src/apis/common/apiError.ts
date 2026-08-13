import axios from 'axios';

import type {
  ApiErrorResponse,
  NormalizedApiError,
} from './apiTypes';

const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';
const UNKNOWN_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다.';

// 서버 응답이 아니라 클라이언트에서 만들어 낸 code들. 이 경우의 message는
// axios/스크립트의 기술적인 문구라 사용자에게 그대로 보여줄 수 없다.
const CLIENT_ERROR_CODES = new Set<string>([
  NETWORK_ERROR_CODE,
  UNKNOWN_ERROR_CODE,
  'ERR_CANCELED',
  'ECONNABORTED',
  'ETIMEDOUT',
]);

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const { response } = error;

    if (response) {
      const responseCode = response.data?.code;
      const responseMessage = response.data?.message;

      return {
        code:
          typeof responseCode === 'string'
            ? responseCode
            : `HTTP_${response.status}`,
        message:
          typeof responseMessage === 'string'
            ? responseMessage
            : error.message,
        status: response.status,
      };
    }

    if (
      error.code === 'ERR_CANCELED' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      return {
        code: error.code,
        message: error.message,
      };
    }

    return {
      code: NETWORK_ERROR_CODE,
      message: error.message,
    };
  }

  // throw data; 형태의 ApiErrorResponse 처리.
  //
  // apiClient 인터셉터가 이미 정규화한 에러가 각 API 함수의 catch를 거쳐
  // 다시 들어오는 경로이기도 하다. 그때 status를 떨어뜨리면 호출부에서
  // HTTP 상태로 분기할 수 없으므로 그대로 옮긴다.
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  ) {
    const status =
      'status' in error && typeof error.status === 'number'
        ? error.status
        : undefined;

    return {
      code: error.code,
      message: error.message,
      ...(status === undefined ? {} : { status }),
    };
  }

  if (error instanceof Error) {
    return {
      code: UNKNOWN_ERROR_CODE,
      message: error.message,
    };
  }

  return {
    code: UNKNOWN_ERROR_CODE,
    message: UNKNOWN_ERROR_MESSAGE,
  };
}

/**
 * 사용자에게 보여줄 에러 문구를 고른다.
 *
 * 서버가 내려준 message는 원인별로 다르게 안내되어 있으므로 그대로 쓰고,
 * 네트워크 오류처럼 클라이언트가 만든 문구일 때만 fallback으로 대체한다.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  const { code, message } = normalizeApiError(error);

  // HTTP_xxx는 서버가 응답했지만 본문에 code가 없던 경우라 message가
  // 'Request failed with status code 500' 같은 문구다.
  if (CLIENT_ERROR_CODES.has(code) || code.startsWith('HTTP_')) {
    return fallbackMessage;
  }

  return message || fallbackMessage;
}