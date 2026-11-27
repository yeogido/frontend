import DesktopHeader from '../layout/desktop/DesktopHeader';
import DesktopFooter from '../layout/desktop/DesktopFooter';

export default function DesktopLoadingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f9f9f9]">
      <DesktopHeader />
      <main
        aria-busy="true"
        className="flex flex-1 items-center justify-center px-6 pb-12"
      >
        <p
          role="status"
          className="text-[18px] leading-normal font-normal text-[#505050]"
        >
          불러오는 중...
        </p>
      </main>
      <DesktopFooter />
    </div>
  );
}
