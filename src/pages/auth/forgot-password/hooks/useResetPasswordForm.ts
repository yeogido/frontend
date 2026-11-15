import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApiErrorMessage } from '../../../../apis/common';
import { resetPassword } from '../../../../apis/auth.api';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schema';

const DEFAULT_RESET_ERROR_MESSAGE =
  '비밀번호 재설정에 실패했습니다. 다시 시도해 주세요.';

/**
 * 비밀번호 재설정 폼의 상태·검증·API 동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 * 찾기 화면에서 넘어온 이메일·토큰이 없으면 찾기 화면으로 되돌린다.
 */
export function useResetPasswordForm() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: {
      email?: string;
      resetToken?: string;
    };
  };
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
  });

  useEffect(() => {
    if (!state?.email || !state?.resetToken) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate, state?.email, state?.resetToken]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!state?.resetToken) {
      return;
    }

    setSubmitError('');

    try {
      await resetPassword({
        resetToken: state.resetToken,
        newPassword: values.password,
      });

      navigate('/login');
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, DEFAULT_RESET_ERROR_MESSAGE));
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    submitError,
    onSubmit,
  };
}
