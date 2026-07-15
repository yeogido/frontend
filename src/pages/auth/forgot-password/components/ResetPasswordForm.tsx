import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResetPasswordForm() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: {
      email?: string;
    };
  };
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const isPasswordFilled = password.trim().length > 0;
  const isPasswordConfirmFilled = passwordConfirm.trim().length > 0;
  const isPasswordMatched =
    isPasswordFilled && isPasswordConfirmFilled && password === passwordConfirm;

  useEffect(() => {
    if (!state?.email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate, state?.email]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPasswordMatched) {
      return;
    }

    navigate('/login');
  };

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex-1">
        <h1 className="text-[28px] font-bold leading-none text-[#1C1C1C] sm:text-[32px]">
          비밀번호 재설정
        </h1>

        <p className="mt-3 text-xs font-medium text-[#7F7F7F]">
          새로운 비밀번호를 입력하고 변경을 완료해 주세요
        </p>

        <form
          className="mt-9"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="reset-password"
                className="mb-2 block text-sm font-bold text-[#1C1C1C]"
              >
                비밀번호
              </label>

              <input
                id="reset-password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />
            </div>

            <div>
              <label
                htmlFor="reset-password-confirm"
                className="mb-2 block text-sm font-bold text-[#1C1C1C]"
              >
                비밀번호 확인
              </label>

              <input
                id="reset-password-confirm"
                type="password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-10">
            <div className="mx-auto w-full max-w-[440px] px-6 pb-10 sm:px-8">
              <button
                type="submit"
                disabled={!isPasswordMatched}
                className="h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#A1A1A1] enabled:bg-[#FF6B4A] enabled:text-white"
              >
                재설정 완료
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ResetPasswordForm;
