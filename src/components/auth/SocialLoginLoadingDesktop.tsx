import { Logo } from '../common';
import { ScaleContext } from '../../contexts/ScaleContext';
import DesktopHeader from '../layout/desktop/DesktopHeader';
import DesktopFooter from '../layout/desktop/DesktopFooter';

/** ?? ??? ??? ???? ?? ???? ???? ??. */
export default function SocialLoginLoadingDesktop() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f9f9f9]">
      <DesktopHeader />
      <main
        className="flex flex-1 flex-col items-center justify-center px-6 pb-12"
        aria-busy="true"
      >
        <div className="h-[48px] w-[148px]">
          <ScaleContext.Provider value={1.2}>
            <Logo />
          </ScaleContext.Provider>
        </div>
        <p
          role="status"
          className="mt-8 text-[18px] font-normal text-[#505050]"
        >
          로그인 처리 중...
        </p>
      </main>
      <DesktopFooter />
    </div>
  );
}
