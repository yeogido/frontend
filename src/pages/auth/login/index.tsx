import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../../../apis/auth.api';
import { useAuthStore } from '../../../store/auth.store';

import { LoginForm } from './components';
import type { LoginFormValues } from './schema';

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
    } catch {
      setSubmitError('이메일 또는 비밀번호를 확인해 주세요.');
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
