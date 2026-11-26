import {
  DesktopFooter,
  DesktopHeader,
} from '../../../components/layout/desktop';
import TermsContent from '../TermsContent';

function TermsDesktopPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <DesktopHeader />
      <main className="mx-auto w-[calc(100%-48px)] max-w-[1048px] flex-1 pt-[120px] pb-[160px]">
        <TermsContent desktop />
      </main>
      <DesktopFooter />
    </div>
  );
}

export default TermsDesktopPage;
