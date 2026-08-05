import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  checkEmail,
  sendEmailCode,
  signup,
  verifyEmailCode,
} from '../../../../apis/auth.api';
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
const SEND_CODE_ERROR_MESSAGE =
  '인증번호 전송에 실패했습니다. 다시 시도해 주세요.';
const SEND_CODE_SUCCESS_MESSAGE =
  '인증번호를 전송했어요. 10분 안에 입력해 주세요.';
const VERIFY_CODE_ERROR_MESSAGE =
  '인증번호가 올바르지 않습니다. 다시 확인해 주세요.';
const VERIFY_CODE_SUCCESS_MESSAGE = '이메일 인증이 완료됐어요.';

type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';
type EmailAuthStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'verifying'
  | 'verified'
  | 'error';

function SignupForm() {
  const navigate = useNavigate();
  const { data: regionsData } = useRegions();
  const [emailCheck, setEmailCheck] = useState<{
    status: EmailCheckStatus;
    message: string;
  }>({ status: 'idle', message: '' });
  const [emailAuth, setEmailAuth] = useState<{
    status: EmailAuthStatus;
    message: string;
    token: string | null;
  }>({ status: 'idle', message: '', token: null });
  const [authCode, setAuthCode] = useState('');
  const [submitError, setSubmitError] = useState('');
  // 이메일이 바뀌거나 새 확인 요청이 시작되면 증가시켜, 응답이 늦게 온
  // 이전 요청이 이후 상태를 덮어쓰지 않도록 막는다.
  const emailCheckRequestIdRef = useRef(0);

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

  // 진행 중인 확인 요청이 있다면 이 시점에 무효화해, 나중에 응답이 와도
  // 이미 바뀐 이메일의 상태를 덮어쓰지 못하게 한다. 이메일 자체가
  // 바뀌었으니 인증 상태(emailVerificationToken 포함)도 초기화해서
  // 재인증을 요구한다.
  const handleEmailChange = () => {
    emailCheckRequestIdRef.current += 1;
    setEmailCheck({ status: 'idle', message: '' });
    setEmailAuth({ status: 'idle', message: '', token: null });
    setAuthCode('');
  };

  const handleEmailBlur = async () => {
    if (!isEmailValid) {
      return;
    }

    const requestId = ++emailCheckRequestIdRef.current;
    setEmailCheck({ status: 'checking', message: '이메일 확인 중...' });

    try {
      const { isAvailable } = await checkEmail(email.trim());

      // 응답을 받은 사이 이메일이 바뀌어 더 최신 요청이 시작됐다면
      // (또는 onChange로 무효화됐다면) 이 응답은 버린다.
      if (emailCheckRequestIdRef.current !== requestId) {
        return;
      }

      setEmailCheck({
        status: isAvailable ? 'available' : 'unavailable',
        message: isAvailable
          ? '사용 가능한 이메일이에요.'
          : '이미 가입된 이메일이에요.',
      });
    } catch (error) {
      if (emailCheckRequestIdRef.current !== requestId) {
        return;
      }

      setEmailCheck({
        status: 'idle',
        message: getApiErrorMessage(error, EMAIL_CHECK_ERROR_MESSAGE),
      });
    }
  };

  // 이미 "이미 가입된 이메일"임을 알고 있으면 인증번호 전송 자체를
  // 막는다. 다만 이메일 입력 후 바로 옆 전송 버튼을 클릭하면 그 클릭이
  // blur를 먼저 유발해 check-email 응답이 오기 전에 전송이 나갈 수도
  // 있다 — 그 경우는 최종 signup() 시점에 USER4091로 걸러진다.
  const canSendCode =
    isEmailValid &&
    emailCheck.status !== 'unavailable' &&
    emailAuth.status !== 'sending' &&
    emailAuth.status !== 'verifying' &&
    emailAuth.status !== 'verified';
  const canEnterCode = emailAuth.status === 'sent' || emailAuth.status === 'error';
  const canVerifyCode = canEnterCode && authCode.trim().length > 0;

  const handleSendCode = async () => {
    if (!canSendCode) {
      return;
    }

    // 재전송 시 이전 인증번호는 서버에서 무효화되므로, 입력창도 함께
    // 비워 사용자가 옛 번호를 다시 입력하지 않게 한다.
    setAuthCode('');
    setEmailAuth({ status: 'sending', message: '', token: null });

    try {
      await sendEmailCode(email.trim());

      setEmailAuth({
        status: 'sent',
        message: SEND_CODE_SUCCESS_MESSAGE,
        token: null,
      });
    } catch (error) {
      setEmailAuth({
        status: 'error',
        message: getApiErrorMessage(error, SEND_CODE_ERROR_MESSAGE),
        token: null,
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!canVerifyCode) {
      return;
    }

    setEmailAuth((prev) => ({ ...prev, status: 'verifying', message: '' }));

    try {
      const { emailVerificationToken } = await verifyEmailCode(
        email.trim(),
        authCode.trim()
      );

      setEmailAuth({
        status: 'verified',
        message: VERIFY_CODE_SUCCESS_MESSAGE,
        token: emailVerificationToken,
      });
    } catch (error) {
      // 인증번호 입력은 그대로 남겨 재입력을 유도한다(입력창을 비우지 않음).
      setEmailAuth({
        status: 'error',
        message: getApiErrorMessage(error, VERIFY_CODE_ERROR_MESSAGE),
        token: null,
      });
    }
  };

  const onSubmit = async (values: SignupFormValues) => {
    if (!emailAuth.token) {
      return;
    }

    setSubmitError('');

    try {
      await signup({
        email: values.email.trim(),
        password: values.password,
        nickname: values.name.trim(),
        gender: values.gender as SignupGender,
        birthYear: values.birthYear,
        regionId: Number(values.regionId),
        emailVerificationToken: emailAuth.token,
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
                  // emailCheckRequestIdRef는 handleEmailChange/handleEmailBlur
                  // 안에서만 읽고 쓴다 — 둘 다 실제 이벤트(change/blur)가
                  // 발생해야 실행되는 콜백이라 렌더링 중엔 절대 접근되지
                  // 않는데도, register()에 전달된다는 이유로 규칙이 오탐한다.
                  // eslint-disable-next-line react-hooks/refs
                  {...register('email', {
                    onChange: handleEmailChange,
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
                  disabled={!canSendCode}
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] text-xs font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                >
                  {emailAuth.status === 'sending' ? '전송 중...' : '인증번호 전송'}
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
                  value={authCode}
                  onChange={(event) => setAuthCode(event.target.value)}
                  disabled={!canEnterCode}
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 disabled:bg-gray-2 disabled:text-gray-4 focus:border-main-5"
                />

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!canVerifyCode}
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] bg-gray-2 text-xs font-bold text-gray-4 disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                >
                  {emailAuth.status === 'verifying' ? '확인 중...' : '인증하기'}
                </button>
              </div>

              {emailAuth.message && (
                <p
                  role="status"
                  className={`text-xs font-medium ${
                    emailAuth.status === 'error' ? 'text-main-5' : 'text-gray-4'
                  }`}
                >
                  {emailAuth.message}
                </p>
              )}
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
          disabled={!isValid || isSubmitting || emailAuth.status !== 'verified'}
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
