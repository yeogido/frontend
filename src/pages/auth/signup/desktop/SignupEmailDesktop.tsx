import { Controller } from 'react-hook-form';

import { ClearableInput, PasswordInput } from '../../../../components/auth';
import AuthDesktopField from '../../../../components/auth/desktop/AuthDesktopField';
import AuthDesktopLayout from '../../../../components/auth/desktop/AuthDesktopLayout';
import {
  AUTH_INLINE_BUTTON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_SUBMIT_BUTTON_CLASS,
  AUTH_TITLE_CLASS,
} from '../../../../components/auth/desktop/authDesktopStyles';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { getFullRegionName } from '../../../../utils/regionName';
import SelectField from '../components/SelectField';
import { SIGNUP_GENDERS, useSignupForm } from '../hooks/useSignupForm';

/** 이메일 회원가입 폼 — Figma 데스크톱 시안(5691:28072). */
function SignupEmailDesktop() {
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

  return (
    <AuthDesktopLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-[32px]"
      >
        <div className="flex flex-col gap-[12px]">
          <h1 className={AUTH_TITLE_CLASS}>회원가입</h1>
          <p className="text-gray-5 text-[14px]">
            여기도를 시작하기 위해 필요한 정보예요
          </p>
        </div>

        <div className="flex flex-col gap-[40px]">
          <div className="flex flex-col gap-[24px]">
            <AuthDesktopField
              id="signup-name"
              label="이름"
              error={errors.name?.message}
            >
              <ClearableInput
                {...register('name')}
                id="signup-name"
                type="text"
                placeholder="이름"
                className={AUTH_INPUT_CLASS}
              />
            </AuthDesktopField>

            <AuthDesktopField
              id="signup-email"
              label="이메일"
              error={errors.email?.message}
            >
              <div className="flex gap-[12px]">
                <ClearableInput
                  {...register('email', {
                    onChange: handleEmailChange,
                    onBlur: handleEmailBlur,
                  })}
                  id="signup-email"
                  type="email"
                  placeholder="이메일"
                  wrapperClassName="min-w-0 flex-1"
                  className={AUTH_INPUT_CLASS}
                />

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!canSendCode}
                  className={AUTH_INLINE_BUTTON_CLASS}
                >
                  {emailAuth.status === 'sending'
                    ? '전송 중...'
                    : '인증번호 전송'}
                </button>
              </div>

              {emailCheck.message ? (
                <p
                  role="status"
                  className={`${AUTH_MESSAGE_CLASS} ${
                    emailCheck.status === 'unavailable'
                      ? 'text-main-5'
                      : 'text-gray-4'
                  }`}
                >
                  {emailCheck.message}
                </p>
              ) : null}

              <div className="flex gap-[12px]">
                <label htmlFor="signup-code" className="sr-only">
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
                  className={AUTH_INPUT_CLASS}
                />

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!canVerifyCode}
                  className={AUTH_INLINE_BUTTON_CLASS}
                >
                  {emailAuth.status === 'verifying' ? '확인 중...' : '인증하기'}
                </button>
              </div>

              {emailAuth.message ? (
                <p
                  role="status"
                  className={`${AUTH_MESSAGE_CLASS} ${
                    emailAuth.status === 'error' ? 'text-main-5' : 'text-gray-4'
                  }`}
                >
                  {emailAuth.message}
                </p>
              ) : null}
            </AuthDesktopField>

            <AuthDesktopField id="signup-password" label="비밀번호">
              <div className="flex flex-col gap-[6px]">
                <PasswordInput
                  {...register('password')}
                  id="signup-password"
                  placeholder="비밀번호"
                  className={AUTH_INPUT_CLASS}
                />

                {errors.password ? (
                  <p
                    role="alert"
                    className={`${AUTH_MESSAGE_CLASS} text-main-5`}
                  >
                    {errors.password.message}
                  </p>
                ) : null}

                <label htmlFor="signup-password-confirm" className="sr-only">
                  비밀번호 확인
                </label>
                <PasswordInput
                  {...register('passwordConfirm')}
                  id="signup-password-confirm"
                  placeholder="비밀번호 확인"
                  className={AUTH_INPUT_CLASS}
                />

                {errors.passwordConfirm ? (
                  <p
                    role="alert"
                    className={`${AUTH_MESSAGE_CLASS} text-main-5`}
                  >
                    {errors.passwordConfirm.message}
                  </p>
                ) : null}
              </div>
            </AuthDesktopField>

            <AuthDesktopField
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
                    compact
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
            </AuthDesktopField>

            <AuthDesktopField
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
                    compact
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: '', label: '성별을 선택해 주세요' },
                      ...SIGNUP_GENDERS.map((genderOption) => ({
                        value: genderOption.value,
                        label: genderOption.label,
                      })),
                    ]}
                  />
                )}
              />
            </AuthDesktopField>

            <AuthDesktopField
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
                    compact
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: '', label: '태어난 연도를 선택해 주세요' },
                      ...BIRTH_YEARS.map((year) => ({
                        value: year,
                        label: year,
                      })),
                    ]}
                  />
                )}
              />
            </AuthDesktopField>
          </div>

          <div className="flex flex-col gap-[16px]">
            {submitError ? (
              <p
                role="alert"
                className="text-main-5 text-center text-[12px] font-medium"
              >
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={
                !isValid || isSubmitting || emailAuth.status !== 'verified'
              }
              className={AUTH_SUBMIT_BUTTON_CLASS}
            >
              {isSubmitting ? '가입 처리 중...' : '여기도 시작하기'}
            </button>
          </div>
        </div>
      </form>
    </AuthDesktopLayout>
  );
}

export default SignupEmailDesktop;
