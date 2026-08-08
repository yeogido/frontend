import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import {
  BusinessVerificationForm,
  BusinessVerificationSuccessDialog,
} from './components';
import { getBusinessVerificationErrorMessage } from './errorMessage';
import { useBusinessVerificationForm } from './hooks/useBusinessVerificationForm';
import { useBusinessVerificationSubmit } from './hooks/useBusinessVerificationSubmit';

function BusinessVerificationPage() {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const form = useBusinessVerificationForm();
  const { mutate, isPending, error } = useBusinessVerificationSubmit();
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = () => {
    if (!form.isSubmittable || isPending) return;
    if (!form.certificate || !form.place) return;

    mutate(
      {
        certificate: form.certificate,
        place: form.place,
        businessAddress: form.businessAddress,
        businessName: form.businessName,
        representativeName: form.representativeName,
        registrationNumber: form.registrationNumber,
        openedAt: form.openedAt,
      },
      { onSuccess: () => setIsVerified(true) }
    );
  };

  const handleSuccessConfirm = () => {
    // 프로필은 GET /users/me/businesses로 스스로 채운다. 인증 성공 시
    // 그 쿼리를 무효화해 두었으므로 넘겨줄 값이 없다.
    navigate('/profile', {
      // 뒤로 가기로 인증 폼에 돌아오면 이미 인증된 정보를 다시 제출하게 된다
      // (BUSINESS_VERIFY4091). 폼을 히스토리에서 치운다.
      replace: true,
    });
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
          query={form.query}
          searchResults={form.searchResults}
          isSearching={form.isSearching}
          place={form.place}
          businessName={form.businessName}
          representativeName={form.representativeName}
          registrationNumber={form.registrationNumber}
          registrationNumberHint={form.registrationNumberHint}
          openedAt={form.openedAt}
          onCertificateChange={form.setCertificate}
          onQueryChange={form.setQuery}
          onPlaceSelect={form.selectPlace}
          onPlaceClear={form.clearPlace}
          onRepresentativeNameChange={form.setRepresentativeName}
          onRegistrationNumberChange={form.setRegistrationNumber}
          onOpenedAtChange={form.setOpenedAt}
        />
      </main>
      {error != null && (
        <p
          role="alert"
          className="text-center text-[#e5484d]"
          style={{
            marginTop: 16 * scale,
            fontSize: 12 * scale,
            lineHeight: `${16 * scale}px`,
          }}
        >
          {getBusinessVerificationErrorMessage(error)}
        </p>
      )}
      <button
        type="button"
        disabled={!form.isSubmittable || isPending}
        onClick={handleSubmit}
        className="bg-main-5 mt-auto flex w-full items-center justify-center rounded-xl font-semibold text-[#f9f9f9] disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
        style={{ height: 52 * scale, fontSize: 18 * scale, marginTop: 16 * scale }}
      >
        {isPending ? '인증 중...' : '사업자 인증하기'}
      </button>
      <BusinessVerificationSuccessDialog
        isOpen={isVerified}
        scale={scale}
        onConfirm={handleSuccessConfirm}
      />
    </ResponsivePageShell>
  );
}

export default BusinessVerificationPage;
