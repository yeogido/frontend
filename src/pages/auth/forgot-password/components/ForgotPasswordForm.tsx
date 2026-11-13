import { useNavigate } from 'react-router-dom';

import {
  AuthField,
  BackButton,
  ClearableInput,
} from '../../../../components/auth';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';


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

const FIELD_ROW_GAP = 8;
const FIELD_GROUP_GAP = 8;

const INPUT_HEIGHT = 48;
const INPUT_RADIUS = 12;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;

const CODE_BUTTON_WIDTH = 82;
const CODE_BUTTON_FONT_SIZE = 12;

const CODE_MESSAGE_FONT_SIZE = 12;
const CODE_MESSAGE_LINE_HEIGHT = 16;

const SUBMIT_HEIGHT = 48;
const SUBMIT_RADIUS = 12;
const SUBMIT_FONT_SIZE = 15;

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
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


  const inputStyle = {
    height: s(INPUT_HEIGHT),
    borderRadius: s(INPUT_RADIUS),
    paddingLeft: s(INPUT_PADDING_X),
    paddingRight: s(INPUT_PADDING_X),
    fontSize: s(INPUT_FONT_SIZE),
  };

  const codeButtonStyle = {
    height: s(INPUT_HEIGHT),
    width: s(CODE_BUTTON_WIDTH),
    borderRadius: s(INPUT_RADIUS),
    fontSize: s(CODE_BUTTON_FONT_SIZE),
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
          비밀번호 찾기
        </h1>

        <p
          className="font-medium text-gray-4"
          style={{
            marginTop: s(DESCRIPTION_MARGIN_TOP),
            fontSize: s(DESCRIPTION_FONT_SIZE),
            lineHeight: `${s(DESCRIPTION_LINE_HEIGHT)}px`,
          }}
        >
          가입 시 사용한 이메일을 입력하고 인증을 진행해 주세요
        </p>

        <form
          style={{ marginTop: s(FORM_MARGIN_TOP) }}
          onSubmit={(event) => event.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <AuthField
            id="forgot-password-email"
            label="이메일"
          >
            <div
              className="flex flex-col"
              style={{ gap: s(FIELD_GROUP_GAP) }}
            >
              <div className="flex" style={{ gap: s(FIELD_ROW_GAP) }}>
                <ClearableInput
                  id="forgot-password-email"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  wrapperClassName="min-w-0 flex-1"
                  className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={() => void handleSendCode()}
                  disabled={!canSendCode}
                  className="shrink-0 cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                  style={codeButtonStyle}
                >
                  {codeAuth.status === 'sending' ? '전송 중...' : '인증번호 전송'}
                </button>
              </div>

              {isCodeSent && (
                <div className="flex" style={{ gap: s(FIELD_ROW_GAP) }}>
                  <label
                    htmlFor="forgot-password-code"
                    className="sr-only"
                  >
                    인증번호
                  </label>

                  <ClearableInput
                    id="forgot-password-code"
                    type="text"
                    placeholder="인증번호"
                    value={code}
                    onChange={(event) => handleCodeChange(event.target.value)}
                    wrapperClassName="min-w-0 flex-1"
                    className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() => void handleVerifyCode()}
                    disabled={!canVerifyCode}
                    className="bg-gray-2 text-gray-4 shrink-0 cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                    style={codeButtonStyle}
                  >
                    {codeAuth.status === 'verifying' ? '확인 중...' : '인증하기'}
                  </button>
                </div>
              )}

              {codeAuth.message && (
                <p
                  role="status"
                  className={`font-medium ${
                    codeAuth.status === 'sendError' ||
                    codeAuth.status === 'verifyError'
                      ? 'text-main-5'
                      : 'text-gray-4'
                  }`}
                  style={{
                    fontSize: s(CODE_MESSAGE_FONT_SIZE),
                    lineHeight: `${s(CODE_MESSAGE_LINE_HEIGHT)}px`,
                  }}
                >
                  {codeAuth.message}
                </p>
              )}
            </div>
          </AuthField>
        </form>
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
            type="button"
            disabled={!isResetButtonEnabled}
            onClick={handleResetPassword}
            className="w-full cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
            style={{
              height: s(SUBMIT_HEIGHT),
              borderRadius: s(SUBMIT_RADIUS),
              fontSize: s(SUBMIT_FONT_SIZE),
            }}
          >
            비밀번호 재설정하기
          </button>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordForm;
