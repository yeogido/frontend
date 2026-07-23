import { Link } from 'react-router-dom';
import { SiNaver } from 'react-icons/si';

import { KakaoIcon } from '../../../../components/auth';

interface SignupStartProps {
  onEmailStart: () => void;
}

function SignupStart({ onEmailStart }: SignupStartProps) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex flex-1 flex-col justify-center pb-2">
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="h-40 w-40 rounded-lg bg-[linear-gradient(45deg,var(--color-background)_25%,transparent_25%),linear-gradient(-45deg,var(--color-background)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--color-background)_75%),linear-gradient(-45deg,transparent_75%,var(--color-background)_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0] bg-white sm:h-44 sm:w-44" />
        </div>

        <div className="mb-[72px] text-center sm:mb-20">
          <h1 className="text-[28px] font-bold leading-[1.25] text-black sm:text-[32px]">
            여기도에 오신 것을
            <br />
            환영해요!
          </h1>

          <p className="mt-5 text-base font-medium text-black">
            나만의 로컬 여행을 지금 시작해 보세요
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/signup/kakao"
            className="flex h-[58px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#FEE500] text-base font-bold text-black"
          >
            <KakaoIcon
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
            카카오로 시작하기
          </Link>

          <Link
            to="/signup/naver"
            className="flex h-[58px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#03C75A] text-base font-bold text-white"
          >
            <SiNaver
              className="text-[18px]"
              aria-hidden="true"
            />
            네이버로 시작하기
          </Link>

          <button
            type="button"
            onClick={onEmailStart}
            className="h-[58px] w-full cursor-pointer rounded-xl border border-gray-2 bg-white text-base font-bold text-black"
          >
            이메일로 시작하기
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-medium text-gray-3">
            이미 계정이 있으신가요?
          </p>

          <Link
            to="/login"
            className="mt-1 inline-block cursor-pointer text-xs font-bold text-gray-5 underline underline-offset-2"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SignupStart;
