import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AuthField,
  BackButton,
  ClearableInput,
  KakaoIcon,
  NaverIcon,
  PasswordInput,
} from '../../../../components/auth';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import {
  loginSchema,
  type LoginFormValues,
} from '../schema';

// Figma 390 디자인 기준 리터럴 px. detail 페이지/SignupStart와 같은 방식으로
// useGlobalScale() 배율을 곱해서 쓴다.
const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;

const TITLE_FONT_SIZE = 28;

const INFO_MESSAGE_MARGIN_TOP = 12;
const INFO_MESSAGE_FONT_SIZE = 12;
const INFO_MESSAGE_LINE_HEIGHT = 16;

const FORM_MARGIN_TOP = 36;
const FIELD_GAP = 20;

const INPUT_HEIGHT = 48;
const INPUT_RADIUS = 12;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;

const SUBMIT_MARGIN_TOP = 16;
const SUBMIT_HEIGHT = 48;
const SUBMIT_RADIUS = 12;
const SUBMIT_FONT_SIZE = 15;

const SUBMIT_ERROR_MARGIN_TOP = 12;
const SUBMIT_ERROR_FONT_SIZE = 12;
const SUBMIT_ERROR_LINE_HEIGHT = 16;

const LINKS_MARGIN_TOP = 16;
const LINKS_GAP = 12;
const LINKS_FONT_SIZE = 12;
const LINKS_LINE_HEIGHT = 16;
const LINK_DIVIDER_HEIGHT = 12;

const SNS_SECTION_MARGIN_TOP = 56;
const SNS_DIVIDER_GAP = 16;
const SNS_LABEL_FONT_SIZE = 12;
const SNS_LABEL_LINE_HEIGHT = 16;
const SNS_BUTTONS_MARGIN_TOP = 24;
const SNS_BUTTONS_GAP = 20;
const SNS_BUTTON_SIZE = 54;
const KAKAO_ICON_SIZE = 24;
const NAVER_ICON_SIZE = 20;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  submitError?: string;
  infoMessage?: string;
  defaultEmail?: string;
  onKakaoLogin?: () => void;
  isKakaoLoading?: boolean;
  onNaverLogin?: () => void;
  isNaverLoading?: boolean;
}

function LoginForm({
  onSubmit,
  submitError,
  onKakaoLogin,
  isKakaoLoading,
  infoMessage,
  defaultEmail,
  onNaverLogin,
  isNaverLoading,
}: LoginFormProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isValid,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    // defaultValues는 최초 마운트 시점에만 반영된다. LoginPage가
    // location.state를 동기적으로 먼저 읽은 뒤 이 컴포넌트를 렌더링하므로
    // 회원가입 직후 넘어온 이메일이 시점 문제 없이 그대로 prefill된다.
    defaultValues: {
      email: defaultEmail ?? '',
      password: '',
    },
  });

  const inputStyle = {
    height: s(INPUT_HEIGHT),
    borderRadius: s(INPUT_RADIUS),
    paddingLeft: s(INPUT_PADDING_X),
    paddingRight: s(INPUT_PADDING_X),
    fontSize: s(INPUT_FONT_SIZE),
  };

  return (
    <div className="min-h-dvh w-full bg-background">
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
            로그인
          </h1>

          {infoMessage && (
            <p
              className="font-medium text-gray-4"
              style={{
                marginTop: s(INFO_MESSAGE_MARGIN_TOP),
                fontSize: s(INFO_MESSAGE_FONT_SIZE),
                lineHeight: `${s(INFO_MESSAGE_LINE_HEIGHT)}px`,
              }}
            >
              {infoMessage}
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ marginTop: s(FORM_MARGIN_TOP) }}
          >
            <div className="flex flex-col" style={{ gap: s(FIELD_GAP) }}>
              <AuthField
                id="login-email"
                label="이메일"
                error={errors.email?.message}
              >
                <ClearableInput
                  {...register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="이메일"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? 'login-email-error' : undefined
                  }
                  className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                  style={inputStyle}
                />
              </AuthField>

              <AuthField
                id="login-password"
                label="비밀번호"
                error={errors.password?.message}
              >
                <PasswordInput
                  {...register('password')}
                  id="login-password"
                  autoComplete="current-password"
                  placeholder="비밀번호"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password
                      ? 'login-password-error'
                      : undefined
                  }
                  className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                  style={inputStyle}
                />
              </AuthField>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-gray-2 text-gray-3 disabled:cursor-not-allowed enabled:bg-main-5 w-full cursor-pointer font-bold enabled:text-white"
              style={{
                marginTop: s(SUBMIT_MARGIN_TOP),
                height: s(SUBMIT_HEIGHT),
                borderRadius: s(SUBMIT_RADIUS),
                fontSize: s(SUBMIT_FONT_SIZE),
              }}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            {submitError && (
              <p
                className="text-main-5 text-center font-medium"
                style={{
                  marginTop: s(SUBMIT_ERROR_MARGIN_TOP),
                  fontSize: s(SUBMIT_ERROR_FONT_SIZE),
                  lineHeight: `${s(SUBMIT_ERROR_LINE_HEIGHT)}px`,
                }}
              >
                {submitError}
              </p>
            )}
          </form>

          <div
            className="flex items-center justify-center font-medium text-gray-3"
            style={{
              marginTop: s(LINKS_MARGIN_TOP),
              gap: s(LINKS_GAP),
              fontSize: s(LINKS_FONT_SIZE),
              lineHeight: `${s(LINKS_LINE_HEIGHT)}px`,
            }}
          >
            <Link
              to="/signup"
              className="cursor-pointer text-gray-3"
            >
              회원가입
            </Link>

            <span
              className="w-px bg-gray-2"
              style={{ height: s(LINK_DIVIDER_HEIGHT) }}
              aria-hidden="true"
            />

            <Link
              to="/forgot-password"
              className="cursor-pointer"
            >
              비밀번호 찾기
            </Link>
          </div>

          <div style={{ marginTop: s(SNS_SECTION_MARGIN_TOP) }}>
            <div
              className="flex items-center"
              style={{ gap: s(SNS_DIVIDER_GAP) }}
            >
              <span className="h-px min-w-0 flex-1 bg-gray-2" />
              <p
                className="shrink-0 font-medium text-gray-3"
                style={{
                  fontSize: s(SNS_LABEL_FONT_SIZE),
                  lineHeight: `${s(SNS_LABEL_LINE_HEIGHT)}px`,
                }}
              >
                SNS로 간편하게 로그인하세요
              </p>
              <span className="h-px min-w-0 flex-1 bg-gray-2" />
            </div>

            <div
              className="flex justify-center"
              style={{
                marginTop: s(SNS_BUTTONS_MARGIN_TOP),
                gap: s(SNS_BUTTONS_GAP),
              }}
            >
              <button
                type="button"
                aria-label="카카오로 로그인"
                onClick={onKakaoLogin}
                disabled={isKakaoLoading}
                className="shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FEE500] text-black shadow-[0_1px_4px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  width: s(SNS_BUTTON_SIZE),
                  height: s(SNS_BUTTON_SIZE),
                  display: 'flex',
                }}
              >
                <KakaoIcon
                  width={s(KAKAO_ICON_SIZE)}
                  height={s(KAKAO_ICON_SIZE)}
                  className="block"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                aria-label="네이버로 로그인"
                onClick={onNaverLogin}
                disabled={isNaverLoading}
                className="shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#03C75A] text-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  width: s(SNS_BUTTON_SIZE),
                  height: s(SNS_BUTTON_SIZE),
                  display: 'flex',
                }}
              >
                <NaverIcon
                  width={s(NAVER_ICON_SIZE)}
                  height={s(NAVER_ICON_SIZE)}
                  className="block"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginForm;
