import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  checkEmail,
  sendEmailCode,
  signup,
  verifyEmailCode,
} from '../../../../apis/auth.api';
import {
  AuthField,
  BackButton,
  ClearableInput,
  PasswordInput,
} from '../../../../components/auth';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useRegions } from '../../../../hooks/useRegions';
import type { SignupGender } from '../../../../types/auth.type';
import { getFullRegionName } from '../../../../utils/regionName';
import {
  signupSchema,
  SIGNUP_EMAIL_PATTERN,
  type SignupFormValues,
} from '../schema';

import SelectField from './SelectField';

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
  '인증번호를 전송했어요. 5분 이내에 입력해 주세요.';
const VERIFY_CODE_ERROR_MESSAGE =
  '인증번호가 올바르지 않습니다. 다시 확인해 주세요.';
const VERIFY_CODE_SUCCESS_MESSAGE = '이메일 인증이 완료됐어요.';

// Figma 390 디자인 기준 리터럴 px. detail 페이지/SignupStart와 같은 방식으로
// useGlobalScale() 배율을 곱해서 쓴다.
const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;

const TITLE_FONT_SIZE = 28;

const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_FONT_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 16;

const FIELDS_MARGIN_TOP = 36;
const FIELDS_GAP = 16;

const FIELD_ROW_GAP = 8;
const FIELD_GROUP_GAP = 8;

const INPUT_HEIGHT = 48;
const INPUT_RADIUS = 12;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;

const CODE_BUTTON_WIDTH = 82;
const CODE_BUTTON_FONT_SIZE = 12;

const FIELD_MESSAGE_FONT_SIZE = 12;
const FIELD_MESSAGE_LINE_HEIGHT = 16;

const SECTION_LABEL_MARGIN_BOTTOM = 12;
const SECTION_LABEL_FONT_SIZE = 14;
const SECTION_LABEL_LINE_HEIGHT = 20;
const SECTION_ERROR_MARGIN_TOP = 4;
const SECTION_ERROR_FONT_SIZE = 12;
const SECTION_ERROR_LINE_HEIGHT = 16;

const SUBMIT_ERROR_MARGIN_TOP = 16;
const SUBMIT_ERROR_FONT_SIZE = 12;
const SUBMIT_ERROR_LINE_HEIGHT = 16;

const SUBMIT_MARGIN_TOP = 32;
const SUBMIT_HEIGHT = 48;
const SUBMIT_RADIUS = 12;
const SUBMIT_FONT_SIZE = 15;

type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';
type EmailAuthStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'verifying'
  | 'verified'
  | 'error';

interface SignupFormProps {
  onBack: () => void;
}

function SignupForm({ onBack }: SignupFormProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
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

  const fieldMessageStyle = {
    fontSize: s(FIELD_MESSAGE_FONT_SIZE),
    lineHeight: `${s(FIELD_MESSAGE_LINE_HEIGHT)}px`,
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
      <form
        className="flex-1"
        onSubmit={handleSubmit(onSubmit)}
      >
        <BackButton onClick={onBack} />

        <h1
          className="font-bold leading-none text-black"
          style={{ fontSize: s(TITLE_FONT_SIZE) }}
        >
          회원가입
        </h1>

        <p
          className="font-medium text-gray-4"
          style={{
            marginTop: s(DESCRIPTION_MARGIN_TOP),
            fontSize: s(DESCRIPTION_FONT_SIZE),
            lineHeight: `${s(DESCRIPTION_LINE_HEIGHT)}px`,
          }}
        >
          여기도를 시작하기 위해 필요한 정보예요
        </p>

        <div
          className="flex flex-col"
          style={{ marginTop: s(FIELDS_MARGIN_TOP), gap: s(FIELDS_GAP) }}
        >
          <AuthField
            id="signup-name"
            label="이름"
            error={errors.name?.message}
          >
            <ClearableInput
              {...register('name')}
              id="signup-name"
              type="text"
              placeholder="이름"
              className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
              style={inputStyle}
            />
          </AuthField>

          <SectionField
            label="이메일"
            htmlFor="signup-email"
            error={errors.email?.message}
          >
            <div
              className="flex flex-col"
              style={{ gap: s(FIELD_GROUP_GAP) }}
            >
              <div className="flex" style={{ gap: s(FIELD_ROW_GAP) }}>
                <ClearableInput
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
                  wrapperClassName="min-w-0 flex-1"
                  className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!canSendCode}
                  className="shrink-0 cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                  style={codeButtonStyle}
                >
                  {emailAuth.status === 'sending' ? '전송 중...' : '인증번호 전송'}
                </button>
              </div>

              {emailCheck.message && (
                <p
                  role="status"
                  className={`font-medium ${
                    emailCheck.status === 'unavailable'
                      ? 'text-main-5'
                      : 'text-gray-4'
                  }`}
                  style={fieldMessageStyle}
                >
                  {emailCheck.message}
                </p>
              )}

              <div className="flex" style={{ gap: s(FIELD_ROW_GAP) }}>
                <label
                  htmlFor="signup-code"
                  className="sr-only"
                >
                  인증번호
                </label>
                <ClearableInput
                  id="signup-code"
                  type="text"
                  placeholder="인증번호"
                  value={authCode}
                  onChange={(event) => setAuthCode(event.target.value)}
                  disabled={!canEnterCode}
                  wrapperClassName="min-w-0 flex-1"
                  className="border-gray-2 placeholder:text-gray-3 disabled:bg-gray-2 disabled:text-gray-4 focus:border-main-5 block w-full border bg-white outline-none"
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!canVerifyCode}
                  className="bg-gray-2 text-gray-4 shrink-0 cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-4 enabled:bg-main-5 enabled:text-white"
                  style={codeButtonStyle}
                >
                  {emailAuth.status === 'verifying' ? '확인 중...' : '인증하기'}
                </button>
              </div>

              {emailAuth.message && (
                <p
                  role="status"
                  className={`font-medium ${
                    emailAuth.status === 'error' ? 'text-main-5' : 'text-gray-4'
                  }`}
                  style={fieldMessageStyle}
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
            <div
              className="flex flex-col"
              style={{ gap: s(FIELD_GROUP_GAP) }}
            >
              <PasswordInput
                {...register('password')}
                id="signup-password"
                placeholder="비밀번호"
                className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                style={inputStyle}
              />

              {errors.password && (
                <p
                  role="alert"
                  className="font-medium text-main-5"
                  style={fieldMessageStyle}
                >
                  {errors.password.message}
                </p>
              )}

              <PasswordInput
                {...register('passwordConfirm')}
                id="signup-password-confirm"
                placeholder="비밀번호 확인"
                className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                style={inputStyle}
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
                  className="font-medium text-main-5"
                  style={fieldMessageStyle}
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
            <Controller
              control={control}
              name="regionId"
              render={({ field }) => (
                <SelectField
                  id="signup-region"
                  ariaLabel="사는 지역"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: '', label: '거주 중인 지역을 선택해 주세요' },
                    ...(regionsData?.regions ?? []).map((region) => ({
                      value: String(region.regionId),
                      label: getFullRegionName(region.name),
                    })),
                  ]}
                />
              )}
            />
          </AuthField>

          <AuthField
            id="signup-gender"
            label="성별"
            error={errors.gender?.message}
          >
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <SelectField
                  id="signup-gender"
                  ariaLabel="성별"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: '', label: '성별을 선택해 주세요' },
                    ...genders.map((genderOption) => ({
                      value: genderOption.value,
                      label: genderOption.label,
                    })),
                  ]}
                />
              )}
            />
          </AuthField>

          <AuthField
            id="signup-birth-year"
            label="태어난 연도"
            error={errors.birthYear?.message}
          >
            <Controller
              control={control}
              name="birthYear"
              render={({ field }) => (
                <SelectField
                  id="signup-birth-year"
                  ariaLabel="태어난 연도"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: '', label: '태어난 연도를 선택해 주세요' },
                    ...BIRTH_YEARS.map((year) => ({ value: year, label: year })),
                  ]}
                />
              )}
            />
          </AuthField>
        </div>

        {submitError && (
          <p
            role="alert"
            className="text-center font-medium text-main-5"
            style={{
              marginTop: s(SUBMIT_ERROR_MARGIN_TOP),
              fontSize: s(SUBMIT_ERROR_FONT_SIZE),
              lineHeight: `${s(SUBMIT_ERROR_LINE_HEIGHT)}px`,
            }}
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting || emailAuth.status !== 'verified'}
          className="w-full cursor-pointer font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
          style={{
            marginTop: s(SUBMIT_MARGIN_TOP),
            height: s(SUBMIT_HEIGHT),
            borderRadius: s(SUBMIT_RADIUS),
            fontSize: s(SUBMIT_FONT_SIZE),
          }}
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
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;

  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block font-bold text-black"
        style={{
          marginBottom: s(SECTION_LABEL_MARGIN_BOTTOM),
          fontSize: s(SECTION_LABEL_FONT_SIZE),
          lineHeight: `${s(SECTION_LABEL_LINE_HEIGHT)}px`,
        }}
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="font-medium text-main-5"
          style={{
            marginTop: s(SECTION_ERROR_MARGIN_TOP),
            fontSize: s(SECTION_ERROR_FONT_SIZE),
            lineHeight: `${s(SECTION_ERROR_LINE_HEIGHT)}px`,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default SignupForm;
