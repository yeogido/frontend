import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../apis/common';
import { login } from '../../../apis/auth.api';
import { useAuthStore } from '../../../store/auth.store';

import { LoginForm } from './components';
import type { LoginFormValues } from './schema';

const DEFAULT_ERROR_MESSAGE = '이메일 또는 비밀번호를 확인해 주세요.';

// 이메일 로그인 API에 실제로 매핑된 에러 코드만 반영 (Notion ErrorCode 문서 "코드" 열 기준).
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
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (values: LoginFormValues) => {
    setSubmitError('');

    try {
      const response = await login(values);

      setAuth(response);
      navigate('/');
    } catch (error) {
      const code = isNormalizedApiError(error) ? error.code : undefined;

      setSubmitError(
        (code && LOGIN_ERROR_MESSAGES[code]) ?? DEFAULT_ERROR_MESSAGE
      );
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      submitError={submitError}
    />
  );
}

export default LoginPage;
