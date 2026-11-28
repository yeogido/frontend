import { Link } from 'react-router-dom';

import { BUSINESS_VERIFICATION_PATH } from '../utils/profileBusinessSection';

/**
 * 프로필의 소상공인 인증 배너(데스크톱). 인증 전 일반 회원에게 인증 화면으로 가는
 * 입구를 보여 준다. Figma 1440 데스크톱 시안(7193:54213) 기준 리터럴 px.
 */
function BusinessVerificationBanner() {
  return (
    <section
      aria-label="소상공인 인증"
      className="bg-main-5 flex min-h-[75px] w-full items-center gap-[12px] rounded-[12px] p-[20px] text-[#f9f9f9]"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
        <h2 className="text-[16px] font-semibold">소상공인 인증</h2>
        <p className="text-[12px]">
          소상공인 인증을 완료하면 홍보 게시물을 등록할 수 있어요
        </p>
      </div>
      <Link
        to={BUSINESS_VERIFICATION_PATH}
        className="text-main-5 shrink-0 rounded-full bg-[#f9f9f9] px-[12px] py-[8px] text-[14px] leading-[normal] font-semibold whitespace-nowrap"
      >
        소상공인 인증하기
      </Link>
    </section>
  );
}

export default BusinessVerificationBanner;
