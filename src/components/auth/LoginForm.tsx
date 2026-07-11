import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SiKakaotalk, SiNaver } from 'react-icons/si';

import {
  loginSchema,
  type LoginFormValues,
} from '../../pages/auth/login/schema';

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  submitError?: string;
}

function LoginForm({ onSubmit, submitError }: LoginFormProps) {
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
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex-1">
        <h1 className="text-[28px] font-bold leading-none text-[#1C1C1C] sm:text-[32px]">
          로그인
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-9"
        >
          <div className="space-y-5">
            <Field
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
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />
            </Field>

            <Field
              id="login-password"
              label="비밀번호"
              error={errors.password?.message}
            >
              <input
                {...register('password')}
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-4 h-12 w-full rounded-[12px] bg-[#E4E4E4] text-[15px] font-bold text-[#A1A1A1] disabled:cursor-not-allowed enabled:bg-[#FF6B4A] enabled:text-white"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

          {submitError && (
            <p className="mt-3 text-center text-xs font-medium text-[#FF6B4A]">
              {submitError}
            </p>
          )}
        </form>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs font-medium text-[#A1A1A1]">
          <Link
            to="/signup"
            className="text-[#A1A1A1]"
          >
            회원가입
          </Link>

          <span
            className="h-3 w-px bg-[#D5D5D5]"
            aria-hidden="true"
          />

          <button type="button">
            비밀번호 찾기
          </button>
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-4">
            <span className="h-px min-w-0 flex-1 bg-[#E4E4E4]" />
            <p className="shrink-0 text-xs font-medium text-[#A1A1A1]">
              SNS로 간편하게 로그인하세요
            </p>
            <span className="h-px min-w-0 flex-1 bg-[#E4E4E4]" />
          </div>

          <div className="mt-6 flex justify-center gap-5">
            <button
              type="button"
              aria-label="카카오로 로그인"
              className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FEE500] text-black shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
            >
              <SiKakaotalk
                className="block size-5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              aria-label="네이버로 로그인"
              className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#03C75A] text-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
            >
              <SiNaver
                className="block size-5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-[#1C1C1C]"
      >
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs font-medium text-[#FF6B4A]">
          {error}
        </p>
      )}
    </div>
  );
}

export default LoginForm;
