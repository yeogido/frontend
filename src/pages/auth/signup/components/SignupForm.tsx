import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';

import {
  AuthField,
  BackButton,
  ClearableInput,
  PasswordInput,
} from '../../../../components/auth';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { getFullRegionName } from '../../../../utils/regionName';

import {
  SIGNUP_GENDERS as genders,
  useSignupForm,
} from '../hooks/useSignupForm';

import SelectField from './SelectField';


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

interface SignupFormProps {
  onBack: () => void;
}

function SignupForm({ onBack }: SignupFormProps) {
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
  const {
    register,
    control,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    regionsData,
    emailCheck,
    emailAuth,
    authCode,
    setAuthCode,
    submitError,
    canSendCode,
    canEnterCode,
    canVerifyCode,
    handleEmailChange,
    handleEmailBlur,
    handleSendCode,
    handleVerifyCode,
    onSubmit,
  } = useSignupForm();


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
