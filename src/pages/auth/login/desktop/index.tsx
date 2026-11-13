import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ClearableInput,
  KakaoIcon,
  NaverIcon,
  PasswordInput,
} from '../../../../components/auth';
import AuthDesktopField from '../../../../components/auth/desktop/AuthDesktopField';
import AuthDesktopLayout from '../../../../components/auth/desktop/AuthDesktopLayout';
import {
  AUTH_INPUT_LARGE_CLASS,
  AUTH_SUBMIT_BUTTON_CLASS,
  AUTH_TITLE_CLASS,
} from '../../../../components/auth/desktop/authDesktopStyles';
import { useLoginPage } from '../hooks/useLoginPage';
import { loginSchema, type LoginFormValues } from '../schema';

// Figma 1440 데스크톱 시안(5661:26957) 기준 리터럴 px.
const SNS_BUTTON_SIZE = 54;
const KAKAO_ICON_SIZE = 24;
const NAVER_ICON_SIZE = 20;

function LoginDesktopPage() {
  const {
    submitError,
    handleLogin,
    handleKakaoLogin,
    isKakaoLoading,
    handleNaverLogin,
    isNaverLoading,
    infoMessage,
    defaultEmail,
  } = useLoginPage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: defaultEmail ?? '',
      password: '',
    },
  });

  return (
    <AuthDesktopLayout>
      <div className="flex flex-col gap-[32px]">
        <div className="flex flex-col gap-[12px]">
          <h1 className={AUTH_TITLE_CLASS}>로그인</h1>
          {infoMessage ? (
            <p role="status" className="text-gray-4 text-[14px] font-medium">
              {infoMessage}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-[67px]">
          <div className="flex flex-col items-center gap-[16px]">
            <form
              onSubmit={handleSubmit(handleLogin)}
              className="flex w-full flex-col gap-[16px]"
            >
              <div className="flex flex-col gap-[8px]">
                <AuthDesktopField
                  id="login-email"
                  label="이메일"
                  hideLabel
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
                    className={AUTH_INPUT_LARGE_CLASS}
                  />
                </AuthDesktopField>

                <AuthDesktopField
                  id="login-password"
                  label="비밀번호"
                  hideLabel
                  error={errors.password?.message}
                >
                  <PasswordInput
                    {...register('password')}
                    id="login-password"
                    autoComplete="current-password"
                    placeholder="비밀번호"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? 'login-password-error' : undefined
                    }
                    className={AUTH_INPUT_LARGE_CLASS}
                  />
                </AuthDesktopField>
              </div>

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={AUTH_SUBMIT_BUTTON_CLASS}
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>

              {submitError ? (
                <p
                  role="alert"
                  className="text-main-5 text-center text-[12px] font-medium"
                >
                  {submitError}
                </p>
              ) : null}
            </form>

            <div className="text-gray-4 flex items-center gap-[12px] text-[14px]">
              <Link to="/signup">회원가입</Link>
              <span className="bg-gray-2 h-[12px] w-px" aria-hidden="true" />
              <Link to="/forgot-password">비밀번호 찾기</Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-[20px]">
            <div className="flex w-full items-center gap-[16px]">
              <span className="bg-gray-2 h-px min-w-0 flex-1" />
              <p className="text-gray-5 shrink-0 text-[14px]">
                SNS로 간편하게 로그인하세요
              </p>
              <span className="bg-gray-2 h-px min-w-0 flex-1" />
            </div>

            <div className="flex items-center justify-center gap-[24px]">
              <button
                type="button"
                aria-label="카카오로 로그인"
                onClick={handleKakaoLogin}
                disabled={isKakaoLoading}
                style={{ width: SNS_BUTTON_SIZE, height: SNS_BUTTON_SIZE }}
                className="flex cursor-pointer items-center justify-center rounded-full bg-[#FEE500] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KakaoIcon
                  width={KAKAO_ICON_SIZE}
                  height={KAKAO_ICON_SIZE}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                aria-label="네이버로 로그인"
                onClick={handleNaverLogin}
                disabled={isNaverLoading}
                style={{ width: SNS_BUTTON_SIZE, height: SNS_BUTTON_SIZE }}
                className="flex cursor-pointer items-center justify-center rounded-full bg-[#03C75A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <NaverIcon
                  width={NAVER_ICON_SIZE}
                  height={NAVER_ICON_SIZE}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthDesktopLayout>
  );
}

export default LoginDesktopPage;
