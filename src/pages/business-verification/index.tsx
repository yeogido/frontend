import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { BusinessVerificationForm } from './components';
import { getBusinessVerificationErrorMessage } from './errorMessage';
import { useBusinessVerificationForm } from './hooks/useBusinessVerificationForm';
import { useBusinessVerificationSubmit } from './hooks/useBusinessVerificationSubmit';
import type { BusinessProfile } from './types';

function BusinessVerificationPage() {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const form = useBusinessVerificationForm();
  const { mutate, isPending, error } = useBusinessVerificationSubmit();

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
      {
        onSuccess: () => {
          // 인증 응답은 role/businessInfoId만 준다. 개업일자는 사업장 목록
          // 조회에도 없어서, 방금 제출한 값을 미리보기로 그대로 넘긴다.
          const profile: BusinessProfile = {
            businessName: form.businessName.trim(),
            businessAddress: form.businessAddress,
            representativeName: form.representativeName.trim(),
            registrationNumber: form.registrationNumber,
            openedAt: form.openedAt,
          };

          navigate('/profile/business-preview', { state: { profile } });
        },
      }
    );
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
          onBusinessNameChange={form.setBusinessName}
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
    </ResponsivePageShell>
  );
}

export default BusinessVerificationPage;
