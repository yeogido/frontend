import axios from 'axios';

import type {
  ApiErrorResponse,
  NormalizedApiError,
} from './api.types';

const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';
const UNKNOWN_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다.';

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const { response } = error;

    if (response) {
      return {
        code: response.data?.code ?? `HTTP_${response.status}`,
        message: response.data?.message ?? error.message,
        status: response.status,
      };
    }

    return {
      code: NETWORK_ERROR_CODE,
      message: error.message,
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
