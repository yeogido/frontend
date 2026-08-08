import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '../../store/auth.store';
import type { LoginResult } from '../../types/auth.type';

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

// 인증 없이 호출되는 엔드포인트. 로그인 요청 등에 이전 세션의 토큰이
// 그대로 붙어 나가는 것을 막기 위해 예외 처리한다. /auth/reissue도
// 포함해야 만료된 accessToken이 재발급 요청 자체에 붙거나, 재발급
// 요청의 401이 또 재발급을 트리거하는 무한 루프를 막을 수 있다.
// /auth/social-login, /auth/social-signup/complete, /auth/check-email,
// /auth/signup, /auth/email/send-code, /auth/email/verify-code도 로그인
// 전(또는 temporaryToken 기반) 요청이라 이전 세션 토큰과 무관해야 한다.
// /auth/password/* (비밀번호 찾기)도 마찬가지로 로그인 전 흐름이다.
const AUTH_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/reissue',
  '/auth/social-login',
  '/auth/social-signup/complete',
  '/auth/check-email',
  '/auth/signup',
  '/auth/email/send-code',
  '/auth/email/verify-code',
  '/auth/password/send-code',
  '/auth/password/verify-code',
  '/auth/password/reset',
];

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function isAuthExemptPath(url?: string): boolean {
  if (!url) return false;
  return AUTH_EXEMPT_PATHS.includes(url);
}

apiClient.interceptors.request.use((config) => {
  if (isAuthExemptPath(config.url)) {
    config.headers.delete('Authorization');
    return config;
  }

  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    config.headers.delete('Authorization');
  }

  return config;
});

let reissuePromise: Promise<string> | null = null;

// 여러 요청이 동시에 401을 받아도 /auth/reissue는 한 번만 호출되도록,
// 진행 중인 재발급 Promise를 공유한다 (kakaoMap.ts의 sdkPromise와 동일한 패턴).
function reissueAccessToken(): Promise<string> {
  if (reissuePromise) {
    return reissuePromise;
  }

  const { refreshToken } = useAuthStore.getState();

  reissuePromise = apiClient
    .post<LoginResult>('/auth/reissue', { refreshToken })
    .then(({ data }) => {
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    })
    .finally(() => {
      reissuePromise = null;
    });

  return reissuePromise;
}

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
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const shouldReissue =
      error.response?.status === 401 &&
      originalRequest &&
      !isAuthExemptPath(originalRequest.url) &&
      !originalRequest._retry;

    if (!shouldReissue) {
      return Promise.reject(normalizeApiError(error));
    }

    originalRequest._retry = true;

    try {
      await reissueAccessToken();
    } catch {
      // refreshToken도 만료/무효(AUTH4013 등) — 로컬 세션을 정리하고
      // 로그인 페이지로 보낸다. 인터셉터는 컴포넌트 트리 밖이라
      // useNavigate를 쓸 수 없어 풀 리로드로 이동한다.
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(normalizeApiError(error));
    }

    // 재발급 자체는 성공했으므로, 재시도가 실패하더라도(재발급과 무관한
    // 별개 오류) 로그아웃 처리하지 않는다. 재시도도 이 인터셉터를 다시
    // 타므로, 실패 시 그 호출에서 이미 정규화되어 reject된다.
    return apiClient(originalRequest);
  }
);

export default apiClient;
