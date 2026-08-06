import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../apis/common';
import { login } from '../../../apis/auth.api';
import { useKakaoLogin } from '../../../hooks/useKakaoLogin';
import { useNaverLogin } from '../../../hooks/useNaverLogin';
import { useAuthStore } from '../../../store/auth.store';

import { LoginForm } from './components';
import type { LoginFormValues } from './schema';

const DEFAULT_ERROR_MESSAGE = '이메일 또는 비밀번호를 확인해 주세요.';
const KAKAO_START_ERROR_MESSAGE =
  '카카오 로그인을 시작하지 못했습니다. 다시 시도해 주세요.';
const NAVER_START_ERROR_MESSAGE =
  '네이버 로그인을 시작하지 못했습니다. 다시 시도해 주세요.';
const SIGNUP_COMPLETED_MESSAGE =
  '가입이 완료됐어요. 로그인해 주세요.';

interface LoginLocationState {
  signupCompleted?: boolean;
  email?: string;
}

// 이메일 로그인 API에 실제로 매핑된 에러 코드만 반영 (Notion ErrorCode 문서 "코드" 열 기준).
// 카카오/네이버 소셜 로그인 에러는 각각 /auth/kakao/callback, /auth/naver/callback에서 처리한다.
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  COMMON4001: '잘못된 요청입니다.',
  AUTH4012: '비밀번호 또는 인증 정보가 일치하지 않습니다.',
  USER4041: '존재하지 않는 회원입니다.',
};

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

function LoginPage() {
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const setAuth = useAuthStore((state) => state.setAuth);
  const { loginWithKakao, isLoading: isKakaoLoading } = useKakaoLogin();
  const { loginWithNaver, isLoading: isNaverLoading } = useNaverLogin();

  const handleLogin = async (values: LoginFormValues) => {
    setSubmitError('');

    try {
      const response = await login(values);

      setAuth(response);
      navigate('/');
    } catch (error) {
      const code = isNormalizedApiError(error) ? error.code : undefined;
      const mappedMessage = code ? LOGIN_ERROR_MESSAGES[code] : undefined;

      setSubmitError(mappedMessage ?? DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleKakaoLogin = async () => {
    setSubmitError('');

    try {
      // authorize()가 성공하면 카카오 로그인 페이지로 리다이렉트되어 이
      // 함수 이후 코드는 실행되지 않는다. 이후 처리(신규/기존 회원 분기,
      // 에러 코드 매핑)는 /auth/kakao/callback(KakaoCallbackPage)에서 한다.
      await loginWithKakao();
    } catch (error) {
      console.error('[카카오 로그인 시작 실패]', error);
      setSubmitError(KAKAO_START_ERROR_MESSAGE);
    }
  };

  const handleNaverLogin = async () => {
    setSubmitError('');

    try {
      // authorize()가 성공하면 네이버 로그인 페이지로 리다이렉트되어 이
      // 함수 이후 코드는 실행되지 않는다. 이후 처리(신규/기존 회원 분기,
      // 에러 코드 매핑)는 /auth/naver/callback(NaverCallbackPage)에서 한다.
      await loginWithNaver();
    } catch (error) {
      console.error('[네이버 로그인 시작 실패]', error);
      setSubmitError(NAVER_START_ERROR_MESSAGE);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      submitError={submitError}
      onKakaoLogin={handleKakaoLogin}
      isKakaoLoading={isKakaoLoading}
      infoMessage={
        locationState?.signupCompleted ? SIGNUP_COMPLETED_MESSAGE : undefined
      }
      defaultEmail={locationState?.email}
      onNaverLogin={handleNaverLogin}
      isNaverLoading={isNaverLoading}
    />
  );
}

export default LoginPage;
