import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isCodeFilled = code.trim().length > 0;

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex-1">
        <h1 className="text-[28px] font-bold leading-none text-[#1C1C1C] sm:text-[32px]">
          비밀번호 찾기
        </h1>

        <p className="mt-3 text-xs font-medium text-[#7F7F7F]">
          가입 시 사용한 이메일을 입력하고 인증을 진행해 주세요
        </p>

        <div className="mt-9">
          <div>
            <label
              htmlFor="forgot-password-email"
              className="mb-2 block text-sm font-bold text-[#1C1C1C]"
            >
              이메일
            </label>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="forgot-password-email"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setIsCodeSent(false);
                    setCode('');
                  }}
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
                />

                <button
                  type="button"
                  disabled={!isEmailValid}
                  onClick={() => setIsCodeSent(true)}
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] text-xs font-bold disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#7F7F7F] enabled:bg-[#FF6B4A] enabled:text-white"
                >
                  인증번호 전송
                </button>
              </div>

              {isCodeSent && (
                <div className="flex gap-2">
                  <label
                    htmlFor="forgot-password-code"
                    className="sr-only"
                  >
                    인증번호
                  </label>

                  <input
                    id="forgot-password-code"
                    type="text"
                    placeholder="인증번호"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="block h-12 min-w-0 flex-1 rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
                  />

                  <button
                    type="button"
                    disabled={!isCodeFilled}
                    onClick={() => navigate('/forgot-password/reset')}
                    className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] bg-[#E4E4E4] text-xs font-bold text-[#7F7F7F] disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#7F7F7F] enabled:bg-[#FF6B4A] enabled:text-white"
                  >
                    인증하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordForm;
