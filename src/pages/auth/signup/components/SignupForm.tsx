import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApiErrorMessage } from '../../../../apis/common';
import { checkEmail, signup } from '../../../../apis/auth.api';
import { AuthField, PasswordInput } from '../../../../components/auth';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { useRegions } from '../../../../hooks/useRegions';
import type { SignupGender } from '../../../../types/auth.type';
import {
  signupSchema,
  SIGNUP_EMAIL_PATTERN,
  type SignupFormValues,
} from '../schema';

const genders: { label: string; value: SignupGender }[] = [
  { label: '여성', value: 'FEMALE' },
  { label: '남성', value: 'MALE' },
  { label: '선택 안 함', value: 'NONE' },
];

const DEFAULT_SIGNUP_ERROR_MESSAGE =
  '회원가입에 실패했습니다. 다시 시도해 주세요.';
const EMAIL_CHECK_ERROR_MESSAGE =
  '이메일 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.';

type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';

function SignupForm() {
  const navigate = useNavigate();
  const { data: regionsData } = useRegions();
  const [emailCheck, setEmailCheck] = useState<{
    status: EmailCheckStatus;
    message: string;
  }>({ status: 'idle', message: '' });
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      regionId: '',
      gender: '',
      birthYear: '',
    },
  });

  const email = useWatch({ control, name: 'email' });
  const isEmailValid = SIGNUP_EMAIL_PATTERN.test(email.trim());

  const handleEmailBlur = async () => {
    if (!isEmailValid) {
      return;
    }

    setEmailCheck({ status: 'checking', message: '이메일 확인 중...' });

    try {
      const { isAvailable } = await checkEmail(email.trim());

      setEmailCheck({
        status: isAvailable ? 'available' : 'unavailable',
        message: isAvailable
          ? '사용 가능한 이메일이에요.'
          : '이미 가입된 이메일이에요.',
      });
    } catch (error) {
      setEmailCheck({
        status: 'idle',
        message: getApiErrorMessage(error, EMAIL_CHECK_ERROR_MESSAGE),
      });
    }
  };

  // TODO: 백엔드 회원가입 이메일 인증 API 스펙 확정 후 연동 예정.
  // send-code/verify-code API는 이미 가입된 회원 전용(비밀번호 찾기)이라
  // 회원가입 중인 신규 이메일에는 쓸 수 없어, 버튼은 UI만 유지하고 막아둔다.
  const handleSendCode = () => {};
  // TODO: 백엔드 회원가입 이메일 인증 API 스펙 확정 후 연동 예정.
  const handleVerifyCode = () => {};

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError('');

    try {
      await signup({
        email: values.email.trim(),
        password: values.password,
        nickname: values.name.trim(),
        gender: values.gender as SignupGender,
        birthYear: values.birthYear,
        regionId: Number(values.regionId),
      });

      navigate('/login', {
        state: { signupCompleted: true, email: values.email.trim() },
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, DEFAULT_SIGNUP_ERROR_MESSAGE));
    }
  };

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px]">
      <form
        className="flex-1"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-[28px] font-bold leading-none text-black">
          회원가입
        </h1>

        <p className="mt-3 text-xs font-medium text-gray-4">
          여기도를 시작하기 위해 필요한 정보예요
        </p>

        <div className="mt-9 space-y-4">
          <AuthField
            id="signup-name"
            label="이름"
            error={errors.name?.message}
          >
              <input
                {...register('name')}
                id="signup-name"
                type="text"
                placeholder="이름"
                className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
              />
          </AuthField>

          <SectionField
            label="이메일"
            htmlFor="signup-email"
            error={errors.email?.message}
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  {...register('email', {
                    onChange: () =>
                      setEmailCheck({ status: 'idle', message: '' }),
                    onBlur: handleEmailBlur,
                  })}
                  id="signup-email"
                  type="email"
                  placeholder="이메일"
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
                />

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] text-xs font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                >
                  인증번호 전송
                </button>
              </div>

              {emailCheck.message && (
                <p
                  role="status"
                  className={`text-xs font-medium ${
                    emailCheck.status === 'unavailable'
                      ? 'text-main-5'
                      : 'text-gray-4'
                  }`}
                >
                  {emailCheck.message}
                </p>
              )}

              <div className="flex gap-2">
                <label
                  htmlFor="signup-code"
                  className="sr-only"
                >
                  인증번호
                </label>
                <input
                  id="signup-code"
                  type="text"
                  placeholder="인증번호"
                  disabled
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 disabled:bg-gray-2 disabled:text-gray-4 focus:border-main-5"
                />

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] bg-gray-2 text-xs font-bold text-gray-4 disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                >
                  인증하기
                </button>
              </div>
            </div>
          </SectionField>

          <SectionField
            label="비밀번호"
            htmlFor="signup-password"
          >
            <div className="space-y-2">
              <PasswordInput
                {...register('password')}
                id="signup-password"
                placeholder="비밀번호"
                className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
              />

              {errors.password && (
                <p
                  role="alert"
                  className="text-xs font-medium text-main-5"
                >
                  {errors.password.message}
                </p>
              )}

              <PasswordInput
                {...register('passwordConfirm')}
                id="signup-password-confirm"
                placeholder="비밀번호 확인"
                className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
              />
              <label
                htmlFor="signup-password-confirm"
                className="sr-only"
              >
                비밀번호 확인
              </label>

              {errors.passwordConfirm && (
                <p
                  role="alert"
                  className="text-xs font-medium text-main-5"
                >
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>
          </SectionField>

          <AuthField
            id="signup-region"
            label="사는 지역"
            error={errors.regionId?.message}
          >
            <SelectField>
              <select
                {...register('regionId')}
                id="signup-region"
                className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
              >
                <option value="">거주 중인 지역을 선택해 주세요</option>
                {(regionsData?.regions ?? []).map((region) => (
                  <option
                    key={region.regionId}
                    value={region.regionId}
                  >
                    {region.name}
                  </option>
                ))}
              </select>
            </SelectField>
          </AuthField>

          <AuthField
            id="signup-gender"
            label="성별"
            error={errors.gender?.message}
          >
            <SelectField>
              <select
                {...register('gender')}
                id="signup-gender"
                className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
              >
                <option value="">성별을 선택해 주세요</option>
                {genders.map((genderOption) => (
                  <option
                    key={genderOption.value}
                    value={genderOption.value}
                  >
                    {genderOption.label}
                  </option>
                ))}
              </select>
            </SelectField>
          </AuthField>

          <AuthField
            id="signup-birth-year"
            label="태어난 연도"
            error={errors.birthYear?.message}
          >
            <SelectField>
              <select
                {...register('birthYear')}
                id="signup-birth-year"
                className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
              >
                <option value="">태어난 연도를 선택해 주세요</option>
                {BIRTH_YEARS.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </SelectField>
          </AuthField>
        </div>

        {submitError && (
          <p
            role="alert"
            className="mt-4 text-center text-xs font-medium text-main-5"
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-8 h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
        >
          {isSubmitting ? '가입 처리 중...' : '여기도 시작하기'}
        </button>
      </form>
    </section>
  );
}

function SectionField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-3 block text-sm font-bold text-black"
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1 text-xs font-medium text-main-5"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}

      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-4"
        fill="none"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default SignupForm;
