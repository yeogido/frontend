import type { KeyboardEvent, ReactNode } from 'react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthField } from '../../../../components/auth';
import {
  signupSchema,
  SIGNUP_EMAIL_PATTERN,
  type SignupFormValues,
} from '../schema';

const regions = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '울산',
  '부산',
  '제주',
];

const genders = ['여성', '남성', '선택 안 함'];

const birthYears = Array.from({ length: 80 }, (_, index) =>
  String(new Date().getFullYear() - index)
);

function SignupForm() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const {
    register,
    control,
    formState: { isValid, errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      region: '',
      gender: '',
      birthYear: '',
    },
  });

  const email = useWatch({ control, name: 'email' });
  const isEmailValid = SIGNUP_EMAIL_PATTERN.test(email.trim());
  const isCodeFilled = code.trim().length > 0;

  const isFormComplete = isValid && isCodeFilled && isCodeVerified;

  const handleSendCode = () => {
    if (!isEmailValid) {
      return;
    }

    setIsCodeSent(true);
    setIsCodeVerified(false);
    setCode('');
  };

  const handleVerifyCode = () => {
    if (!isCodeFilled) {
      return;
    }

    setIsCodeVerified(true);
  };

  const handleSignup = () => {
    if (!isFormComplete) {
      return;
    }

    return;
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

    if (!isCodeSent) {
      handleSendCode();
      return;
    }

    if (!isCodeVerified) {
      handleVerifyCode();
      return;
    }

    handleSignup();
  };

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px]">
      <form
        className="flex-1"
        onSubmit={(event) => event.preventDefault()}
        onKeyDown={handleKeyDown}
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
                    onChange: () => {
                      setIsCodeSent(false);
                      setIsCodeVerified(false);
                      setCode('');
                    },
                  })}
                  id="signup-email"
                  type="email"
                  placeholder="이메일"
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
                />

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!isEmailValid}
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] text-xs font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                >
                  인증번호 전송
                </button>
              </div>

              {isCodeSent && (
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
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={!isCodeFilled}
                    className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] bg-gray-2 text-xs font-bold text-gray-4 disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                  >
                    인증하기
                  </button>
                </div>
              )}
            </div>
          </SectionField>

          <SectionField
            label="비밀번호"
            htmlFor="signup-password"
          >
            <div className="space-y-2">
              <input
                {...register('password')}
                id="signup-password"
                type="password"
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

              <input
                {...register('passwordConfirm')}
                id="signup-password-confirm"
                type="password"
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
            error={errors.region?.message}
          >
            <SelectField>
              <select
                {...register('region')}
                id="signup-region"
                className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
              >
                <option value="">거주 중인 지역을 선택해 주세요</option>
                {regions.map((region) => (
                  <option
                    key={region}
                    value={region}
                  >
                    {region}
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
                {genders.map((gender) => (
                  <option
                    key={gender}
                    value={gender}
                  >
                    {gender}
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
                {birthYears.map((year) => (
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

        <button
          type="button"
          onClick={handleSignup}
          disabled={!isFormComplete}
          className="mt-8 h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
        >
          여기도 시작하기
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
