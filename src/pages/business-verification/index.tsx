import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { BusinessVerificationForm } from './components';
import { useBusinessVerificationForm } from './hooks/useBusinessVerificationForm';

function BusinessVerificationPage() {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const form = useBusinessVerificationForm();

  const handleSubmit = () => {
    if (!form.isSubmittable) return;

    navigate('/profile/business-preview');
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      bottomPadding={32}
      className="bg-[#f9f9f9]"
      style={{ minHeight: 1046 * scale }}
    >
      <main className="flex flex-1 flex-col" style={{ paddingTop: 56 * scale }}>
        <header className="flex flex-col" style={{ gap: 12 * scale }}>
          <h1
            className="font-semibold text-[#1c1c1c]"
            style={{ fontSize: 32 * scale, lineHeight: `${38 * scale}px` }}
          >
            소상공인
            <br />
            인증을 완료해 주세요
          </h1>
          <p
            className="text-[#505050]"
            style={{ fontSize: 14 * scale, lineHeight: `${17 * scale}px` }}
          >
            소상공인 인증을 완료하면 홍보 게시물을 등록할 수 있어요
          </p>
        </header>
        <BusinessVerificationForm
          scale={scale}
          address={form.address}
          representativeName={form.representativeName}
          registrationNumber={form.registrationNumber}
          openedAt={form.openedAt}
          onCertificateChange={form.setCertificate}
          onAddressChange={form.setAddress}
          onRepresentativeNameChange={form.setRepresentativeName}
          onRegistrationNumberChange={form.setRegistrationNumber}
          onOpenedAtChange={form.setOpenedAt}
        />
      </main>
      <button
        type="button"
        disabled={!form.isSubmittable}
        onClick={handleSubmit}
        className="bg-main-5 mt-auto flex w-full items-center justify-center rounded-xl font-semibold text-[#f9f9f9] disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
        style={{ height: 52 * scale, fontSize: 18 * scale }}
      >
        사업자 인증하기
      </button>
    </ResponsivePageShell>
  );
}

export default BusinessVerificationPage;
