import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApiErrorMessage } from '../../../../apis/common';
import { resetPassword } from '../../../../apis/auth.api';
import {
  AuthField,
  BackButton,
  PasswordInput,
} from '../../../../components/auth';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schema';

const DEFAULT_RESET_ERROR_MESSAGE =
  '비밀번호 재설정에 실패했습니다. 다시 시도해 주세요.';

// Figma 390 디자인 기준 리터럴 px. detail 페이지/SignupStart와 같은 방식으로
// useGlobalScale() 배율을 곱해서 쓴다.
const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;

const TITLE_FONT_SIZE = 28;

const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_FONT_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 16;

const FORM_MARGIN_TOP = 36;
const FIELD_GAP = 16;

const INPUT_HEIGHT = 48;
const INPUT_RADIUS = 12;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;

const SUBMIT_ERROR_FONT_SIZE = 12;
const SUBMIT_ERROR_LINE_HEIGHT = 16;

const SUBMIT_HEIGHT = 48;
const SUBMIT_RADIUS = 12;
const SUBMIT_FONT_SIZE = 15;

function ResetPasswordForm() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
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
    formState: {
      errors,
      isValid,
      isSubmitting,
    },
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

  const inputStyle = {
    height: s(INPUT_HEIGHT),
    borderRadius: s(INPUT_RADIUS),
    paddingLeft: s(INPUT_PADDING_X),
    paddingRight: s(INPUT_PADDING_X),
    fontSize: s(INPUT_FONT_SIZE),
  };

  return (
    <section
      className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col"
      style={{
        paddingLeft: s(PAGE_PADDING_X),
        paddingRight: s(PAGE_PADDING_X),
        paddingTop: s(PAGE_PADDING_TOP),
        paddingBottom: s(PAGE_PADDING_BOTTOM),
      }}
    >
      <div className="flex-1">
        <BackButton onClick={() => navigate(-1)} />

        <h1
          className="font-bold leading-none text-black"
          style={{ fontSize: s(TITLE_FONT_SIZE) }}
        >
          비밀번호 재설정
        </h1>

        <p
          className="font-medium text-gray-4"
          style={{
            marginTop: s(DESCRIPTION_MARGIN_TOP),
            fontSize: s(DESCRIPTION_FONT_SIZE),
            lineHeight: `${s(DESCRIPTION_LINE_HEIGHT)}px`,
          }}
        >
          새로운 비밀번호를 입력하고 변경을 완료해 주세요
        </p>

        <form
          style={{ marginTop: s(FORM_MARGIN_TOP) }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col" style={{ gap: s(FIELD_GAP) }}>
            <AuthField
              id="reset-password"
              label="비밀번호"
              error={errors.password?.message}
            >
              <PasswordInput
                {...register('password')}
                id="reset-password"
                placeholder="비밀번호"
                className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                style={inputStyle}
              />
            </AuthField>

            <AuthField
              id="reset-password-confirm"
              label="비밀번호 확인"
              error={errors.passwordConfirm?.message}
            >
              <PasswordInput
                {...register('passwordConfirm')}
                id="reset-password-confirm"
                placeholder="비밀번호 확인"
                className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                style={inputStyle}
              />
            </AuthField>

            {submitError && (
              <p
                role="alert"
                className="text-center font-medium text-main-5"
                style={{
                  fontSize: s(SUBMIT_ERROR_FONT_SIZE),
                  lineHeight: `${s(SUBMIT_ERROR_LINE_HEIGHT)}px`,
                }}
              >
                {submitError}
              </p>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-10">
            <div
              className="mx-auto w-full max-w-[500px]"
              style={{
                paddingLeft: s(PAGE_PADDING_X),
                paddingRight: s(PAGE_PADDING_X),
                paddingBottom: s(PAGE_PADDING_BOTTOM),
              }}
            >
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
                style={{
                  height: s(SUBMIT_HEIGHT),
                  borderRadius: s(SUBMIT_RADIUS),
                  fontSize: s(SUBMIT_FONT_SIZE),
                }}
              >
                {isSubmitting ? '재설정 중...' : '재설정 완료'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ResetPasswordForm;
