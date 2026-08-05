import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AuthField,
  KakaoIcon,
  NaverIcon,
  PasswordInput,
} from '../../../../components/auth';

import {
  loginSchema,
  type LoginFormValues,
} from '../schema';

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

// 이 브랜치는 네이버 소셜 로그인만 다룬다. onKakaoLogin/isKakaoLoading은
// 카카오 작업 재개 시 쓸 수 있도록 타입만 유지하고, 여기서는 받지 않는다.
function LoginForm({
  onSubmit,
  submitError,
  infoMessage,
  defaultEmail,
  onNaverLogin,
  isNaverLoading,
}: LoginFormProps) {
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

  return (
    <div className="min-h-dvh w-full bg-background">
      <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px]">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold leading-none text-black">
            로그인
          </h1>

          {infoMessage && (
            <p className="mt-3 text-xs font-medium text-gray-4">
              {infoMessage}
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-9"
          >
            <div className="space-y-5">
              <AuthField
                id="login-email"
                label="이메일"
                error={errors.email?.message}
              >
                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="이메일"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? 'login-email-error' : undefined
                  }
                  className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
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
                  className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
                />
              </AuthField>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="mt-4 h-12 w-full cursor-pointer rounded-[12px] bg-gray-2 text-[15px] font-bold text-gray-3 disabled:cursor-not-allowed enabled:bg-main-5 enabled:text-white"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            {submitError && (
              <p className="mt-3 text-center text-xs font-medium text-main-5">
                {submitError}
              </p>
            )}
          </form>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs font-medium text-gray-3">
            <Link
              to="/signup"
              className="cursor-pointer text-gray-3"
            >
              회원가입
            </Link>

            <span
              className="h-3 w-px bg-gray-2"
              aria-hidden="true"
            />

            <Link
              to="/forgot-password"
              className="cursor-pointer"
            >
              비밀번호 찾기
            </Link>
          </div>

          <div className="mt-14">
            <div className="flex items-center gap-4">
              <span className="h-px min-w-0 flex-1 bg-gray-2" />
              <p className="shrink-0 text-xs font-medium text-gray-3">
                SNS로 간편하게 로그인하세요
              </p>
              <span className="h-px min-w-0 flex-1 bg-gray-2" />
            </div>

            <div className="mt-6 flex justify-center gap-5">
              <button
                type="button"
                aria-label="카카오로 로그인"
                className="flex size-13.5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FEE500] text-black shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
              >
                <KakaoIcon
                  width={24}
                  height={24}
                  className="block"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                aria-label="네이버로 로그인"
                onClick={onNaverLogin}
                disabled={isNaverLoading}
                className="flex size-13.5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#03C75A] text-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <NaverIcon
                  width={20}
                  height={20}
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
