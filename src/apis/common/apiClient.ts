import axios from 'axios';

import { useAuthStore } from '../../store/auth.store';

import { normalizeApiError } from './apiError';
import type { ApiResponse } from './apiTypes';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    config.headers.delete('Authorization');
  }

  return config;
});

// 서버 응답은 항상 { isSuccess, code, message, result } 형태로 감싸져 있다.
//
// - 성공(2xx) 응답만 여기서 result를 벗겨서 각 API 함수가 실제 데이터 타입을
//   그대로 받도록 한다.
// - 실패 응답은 이 wrapper를 절대 벗기지 않는다. error.response.data(=
//   { isSuccess: false, code, message })를 그대로 normalizeApiError에 넘겨서,
//   그 안에서 code/message를 읽어 NormalizedApiError로 변환한다.
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;

    if (body && typeof body === 'object' && 'result' in body) {
      response.data = body.result;
    }

    return response;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

export default apiClient;
