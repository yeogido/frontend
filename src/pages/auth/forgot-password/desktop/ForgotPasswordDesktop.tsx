import { ClearableInput } from '../../../../components/auth';
import AuthDesktopField from '../../../../components/auth/desktop/AuthDesktopField';
import AuthDesktopLayout from '../../../../components/auth/desktop/AuthDesktopLayout';
import {
  AUTH_INLINE_BUTTON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_SUBMIT_BUTTON_CLASS,
  AUTH_TITLE_CLASS,
} from '../../../../components/auth/desktop/authDesktopStyles';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

// Figma 1440 데스크톱 시안(5691:28159, 5691:28258) 기준 리터럴 px.
const CONTENT_MIN_HEIGHT = 450;

/** 비밀번호 찾기 — 이메일 인증 후 재설정 화면으로 넘어간다. */
function ForgotPasswordDesktop() {
  const {
    email,
    code,
    codeAuth,
    isCodeSent,
    canSendCode,
    canVerifyCode,
    isResetButtonEnabled,
    handleEmailChange,
    handleCodeChange,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleKeyDown,
  } = useForgotPasswordForm();

  return (
    <AuthDesktopLayout>
      <form
        style={{ minHeight: CONTENT_MIN_HEIGHT }}
        className="flex flex-col justify-between gap-[32px]"
        onSubmit={(event) => event.preventDefault()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[12px]">
            <h1 className={AUTH_TITLE_CLASS}>비밀번호 찾기</h1>
            <p className="text-gray-5 text-[14px]">
              가입 시 사용한 이메일을 입력하고 인증을 진행해 주세요
            </p>
          </div>

          <AuthDesktopField id="forgot-password-email" label="이메일">
            <div className="flex gap-[12px]">
              <ClearableInput
                id="forgot-password-email"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                wrapperClassName="min-w-0 flex-1"
                className={AUTH_INPUT_CLASS}
              />

              <button
                type="button"
                onClick={() => void handleSendCode()}
                disabled={!canSendCode}
                className={AUTH_INLINE_BUTTON_CLASS}
              >
                {codeAuth.status === 'sending' ? '전송 중...' : '인증번호 전송'}
              </button>
            </div>

            {isCodeSent ? (
              <div className="flex gap-[12px]">
                <label htmlFor="forgot-password-code" className="sr-only">
                  인증번호
                </label>
                <ClearableInput
                  id="forgot-password-code"
                  type="text"
                  placeholder="인증번호"
                  value={code}
                  onChange={(event) => handleCodeChange(event.target.value)}
                  wrapperClassName="min-w-0 flex-1"
                  className={AUTH_INPUT_CLASS}
                />

                <button
                  type="button"
                  onClick={() => void handleVerifyCode()}
                  disabled={!canVerifyCode}
                  className={AUTH_INLINE_BUTTON_CLASS}
                >
                  {codeAuth.status === 'verifying' ? '확인 중...' : '인증하기'}
                </button>
              </div>
            ) : null}

            {codeAuth.message ? (
              <p
                role="status"
                className={`${AUTH_MESSAGE_CLASS} ${
                  codeAuth.status === 'sendError' ||
                  codeAuth.status === 'verifyError'
                    ? 'text-main-5'
                    : 'text-gray-4'
                }`}
              >
                {codeAuth.message}
              </p>
            ) : null}
          </AuthDesktopField>
        </div>

        <button
          type="button"
          disabled={!isResetButtonEnabled}
          onClick={handleResetPassword}
          className={AUTH_SUBMIT_BUTTON_CLASS}
        >
          비밀번호 재설정하기
        </button>
      </form>
    </AuthDesktopLayout>
  );
}

export default ForgotPasswordDesktop;
