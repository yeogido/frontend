import { Link } from 'react-router-dom';
import { SiKakaotalk, SiNaver } from 'react-icons/si';

interface SignupStartProps {
  onEmailStart: () => void;
}

function SignupStart({ onEmailStart }: SignupStartProps) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex flex-1 flex-col justify-center pb-2">
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="h-40 w-40 rounded-lg bg-[linear-gradient(45deg,#F0F0F0_25%,transparent_25%),linear-gradient(-45deg,#F0F0F0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#F0F0F0_75%),linear-gradient(-45deg,transparent_75%,#F0F0F0_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0] bg-white sm:h-44 sm:w-44" />
        </div>

        <div className="mb-[72px] text-center sm:mb-20">
          <h1 className="text-[28px] font-bold leading-[1.25] text-[#1C1C1C] sm:text-[32px]">
            여기도에 오신 것을
            <br />
            환영해요!
          </h1>

          <p className="mt-5 text-base font-medium text-[#1C1C1C]">
            나만의 로컬 여행을 지금 시작해 보세요
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] text-base font-bold text-[#1C1C1C]"
          >
            <SiKakaotalk
              className="text-[18px]"
              aria-hidden="true"
            />
            카카오로 시작하기
          </button>

          <button
            type="button"
            className="flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#03C75A] text-base font-bold text-white"
          >
            <SiNaver
              className="text-[18px]"
              aria-hidden="true"
            />
            네이버로 시작하기
          </button>

          <button
            type="button"
            onClick={onEmailStart}
            className="h-[58px] w-full rounded-xl border border-[#E4E4E4] bg-white text-base font-bold text-[#1C1C1C]"
          >
            이메일로 시작하기
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-medium text-[#A1A1A1]">
            이미 계정이 있으신가요?
          </p>

          <Link
            to="/login"
            className="mt-1 inline-block text-xs font-bold text-[#555555] underline underline-offset-2"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SignupStart;
