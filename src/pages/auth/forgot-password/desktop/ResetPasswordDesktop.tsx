import { PasswordInput } from '../../../../components/auth';
import AuthDesktopField from '../../../../components/auth/desktop/AuthDesktopField';
import AuthDesktopLayout from '../../../../components/auth/desktop/AuthDesktopLayout';
import {
  AUTH_INPUT_CLASS,
  AUTH_MESSAGE_CLASS,
  AUTH_SUBMIT_BUTTON_CLASS,
  AUTH_TITLE_CLASS,
} from '../../../../components/auth/desktop/authDesktopStyles';
import { useResetPasswordForm } from '../hooks/useResetPasswordForm';

// Figma 1440 데스크톱 시안(5691:28327) 기준 리터럴 px.
const CONTENT_MIN_HEIGHT = 450;

/** 비밀번호 재설정 — 새 비밀번호를 입력하고 변경을 마친다. */
function ResetPasswordDesktop() {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    submitError,
    onSubmit,
  } = useResetPasswordForm();

  return (
    <AuthDesktopLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ minHeight: CONTENT_MIN_HEIGHT }}
        className="flex flex-col justify-between gap-[32px]"
      >
        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[12px]">
            <h1 className={AUTH_TITLE_CLASS}>비밀번호 재설정</h1>
            <p className="text-gray-5 text-[14px]">
              새로운 비밀번호를 입력하고 변경을 완료해 주세요
            </p>
          </div>

          <AuthDesktopField id="reset-password" label="비밀번호">
            <div className="flex flex-col gap-[6px]">
              <PasswordInput
                {...register('password')}
                id="reset-password"
                placeholder="비밀번호"
                autoComplete="new-password"
                className={AUTH_INPUT_CLASS}
              />

              {errors.password ? (
                <p role="alert" className={`${AUTH_MESSAGE_CLASS} text-main-5`}>
                  {errors.password.message}
                </p>
              ) : null}

              <label htmlFor="reset-password-confirm" className="sr-only">
                비밀번호 확인
              </label>
              <PasswordInput
                {...register('passwordConfirm')}
                id="reset-password-confirm"
                placeholder="비밀번호 확인"
                autoComplete="new-password"
                className={AUTH_INPUT_CLASS}
              />

              {errors.passwordConfirm ? (
                <p role="alert" className={`${AUTH_MESSAGE_CLASS} text-main-5`}>
                  {errors.passwordConfirm.message}
                </p>
              ) : null}
            </div>
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
            disabled={!isValid || isSubmitting}
            className={AUTH_SUBMIT_BUTTON_CLASS}
          >
            {isSubmitting ? '재설정 중...' : '재설정 완료'}
          </button>
        </div>
      </form>
    </AuthDesktopLayout>
  );
}

export default ResetPasswordDesktop;
