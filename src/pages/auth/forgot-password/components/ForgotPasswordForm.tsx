import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from '../../../../apis/auth.api';
import { AuthField } from '../../../../components/auth';
import { SIGNUP_EMAIL_PATTERN } from '../../signup/schema';

const SEND_CODE_ERROR_MESSAGE =
  '인증번호 전송에 실패했습니다. 다시 시도해 주세요.';
const SEND_CODE_SUCCESS_MESSAGE =
  '인증번호를 전송했어요. 이메일을 확인해 주세요.';
const VERIFY_CODE_ERROR_MESSAGE =
  '인증번호가 올바르지 않습니다. 다시 확인해 주세요.';

type CodeStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'verifying'
  | 'verified'
  | 'error';

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeAuth, setCodeAuth] = useState<{
    status: CodeStatus;
    message: string;
    resetToken: string | null;
  }>({ status: 'idle', message: '', resetToken: null });

  const isEmailValid = SIGNUP_EMAIL_PATTERN.test(email.trim());
  const isCodeSent =
    codeAuth.status === 'sent' ||
    codeAuth.status === 'verifying' ||
    codeAuth.status === 'verified' ||
    codeAuth.status === 'error';
  const isCodeFilled = code.trim().length > 0;
  const canSendCode =
    isEmailValid &&
    codeAuth.status !== 'sending' &&
    codeAuth.status !== 'verifying';
  const canVerifyCode =
    isCodeSent && isCodeFilled && codeAuth.status !== 'verifying';
  const isResetButtonEnabled = codeAuth.status === 'verified';

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setCode('');
    setCodeAuth({ status: 'idle', message: '', resetToken: null });
  };

  const handleSendCode = async () => {
    if (!canSendCode) {
      return;
    }

    setCode('');
    setCodeAuth({ status: 'sending', message: '', resetToken: null });

    try {
      await sendPasswordResetCode(email.trim());

      setCodeAuth({
        status: 'sent',
        message: SEND_CODE_SUCCESS_MESSAGE,
        resetToken: null,
      });
    } catch (error) {
      setCodeAuth({
        status: 'error',
        message: getApiErrorMessage(error, SEND_CODE_ERROR_MESSAGE),
        resetToken: null,
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!canVerifyCode) {
      return;
    }

    setCodeAuth((prev) => ({ ...prev, status: 'verifying', message: '' }));

    try {
      const { resetToken } = await verifyPasswordResetCode(
        email.trim(),
        code.trim()
      );

      setCodeAuth({ status: 'verified', message: '', resetToken });
    } catch (error) {
      // 인증번호 입력은 그대로 남겨 재입력을 유도한다(입력창을 비우지 않음).
      setCodeAuth({
        status: 'error',
        message: getApiErrorMessage(error, VERIFY_CODE_ERROR_MESSAGE),
        resetToken: null,
      });
    }
  };

  const handleResetPassword = () => {
    if (!isResetButtonEnabled || !codeAuth.resetToken) {
      return;
    }

    navigate('/forgot-password/reset', {
      state: { email: email.trim(), resetToken: codeAuth.resetToken },
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.tagName === 'BUTTON') {
      return;
    }

    event.preventDefault();

    if (codeAuth.status !== 'verified') {
      if (!isCodeSent) {
        void handleSendCode();
        return;
      }

      void handleVerifyCode();
      return;
    }

    handleResetPassword();
  };

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px]">
      <div className="flex-1">
        <h1 className="text-[28px] font-bold leading-none text-black">
          비밀번호 찾기
        </h1>

        <p className="mt-3 text-xs font-medium text-gray-4">
          가입 시 사용한 이메일을 입력하고 인증을 진행해 주세요
        </p>

        <form
          className="mt-9"
          onSubmit={(event) => event.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <AuthField
            id="forgot-password-email"
            label="이메일"
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="forgot-password-email"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
                />

                <button
                  type="button"
                  onClick={() => void handleSendCode()}
                  disabled={!canSendCode}
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] text-xs font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                >
                  {codeAuth.status === 'sending' ? '전송 중...' : '인증번호 전송'}
                </button>
              </div>

              {isCodeSent && (
                <div className="flex gap-2">
                  <label
                    htmlFor="forgot-password-code"
                    className="sr-only"
                  >
                    인증번호
                  </label>

                  <input
                    id="forgot-password-code"
                    type="text"
                    placeholder="인증번호"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setCodeAuth((prev) =>
                        prev.status === 'verified'
                          ? { status: 'sent', message: '', resetToken: null }
                          : prev
                      );
                    }}
                    className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
                  />

                  <button
                    type="button"
                    onClick={() => void handleVerifyCode()}
                    disabled={!canVerifyCode}
                    className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] bg-gray-2 text-xs font-bold text-gray-4 disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                  >
                    {codeAuth.status === 'verifying' ? '확인 중...' : '인증하기'}
                  </button>
                </div>
              )}

              {codeAuth.message && (
                <p
                  role="status"
                  className={`text-xs font-medium ${
                    codeAuth.status === 'error' ? 'text-main-5' : 'text-gray-4'
                  }`}
                >
                  {codeAuth.message}
                </p>
              )}
            </div>
          </AuthField>
        </form>
      </div>

          <div className="fixed inset-x-0 bottom-0 z-10">
        <div className="mx-auto w-full max-w-[440px] px-6 pb-10">
          <button
            type="button"
            disabled={!isResetButtonEnabled}
            onClick={handleResetPassword}
            className="h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
          >
            비밀번호 재설정하기
          </button>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordForm;
