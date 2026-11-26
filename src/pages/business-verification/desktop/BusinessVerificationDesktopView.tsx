import { useState } from 'react';

import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import {
  BusinessVerificationConfirmDialog,
  BusinessVerificationSuccessDialog,
} from '../components';
import { getBusinessVerificationErrorMessage } from '../errorMessage';
import type { useBusinessVerificationForm } from '../hooks/useBusinessVerificationForm';
import { BusinessVerificationDesktopForm } from './BusinessVerificationDesktopForm';

// 다이얼로그에 넘기는 크기 배율. 두 다이얼로그는 390 기준 크기를 scale로 키우는
// 구조인데, 데스크톱에서는 키우지 않고 그대로 쓴다. 레이아웃 상수
// DESKTOP_SCALE(1.25)과는 다른 값이다.
const DIALOG_SCALE = 1;

interface BusinessVerificationDesktopViewProps {
  readonly form: ReturnType<typeof useBusinessVerificationForm>;
  readonly isPending: boolean;
  readonly error: unknown;
  readonly isVerified: boolean;
  readonly onSubmit: () => void;
  readonly onSuccessConfirm: () => void;
}

/**
 * 데스크톱 사업자 인증 화면. 상태와 제출은 모바일과 같은 훅이 맡고 여기서는
 * 화면과, 제출 전에 사업장을 한 번 더 확인받는 다이얼로그만 둔다.
 */
export function BusinessVerificationDesktopView({
  form,
  isPending,
  error,
  isVerified,
  onSubmit,
  onSuccessConfirm,
}: BusinessVerificationDesktopViewProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isSubmitDisabled = !form.isSubmittable || isPending;

  const handleSubmitClick = () => {
    if (isSubmitDisabled) return;

    setIsConfirmOpen(true);
  };

  // 닫고 나서 제출한다. 진행 중에는 아래 버튼이 "인증 중..."으로 막히고, 실패하면
  // 오류 문구가 폼 아래에 보여서 다이얼로그를 붙잡아 둘 필요가 없다.
  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onSubmit();
  };

  // 선택한 장소를 지우고 검색으로 돌아간다.
  const handleReselect = () => {
    setIsConfirmOpen(false);
    form.clearPlace();
  };

  return (
    <DesktopPageShell>
      <div className="flex flex-col gap-[60px]">
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] leading-[normal] font-semibold text-[#1c1c1c]">
            소상공인 인증을 완료해 주세요
          </h1>
          <p className="text-[20px] leading-[1.5] font-medium text-[#505050]">
            소상공인 인증을 완료하면 홍보 게시물을 등록할 수 있어요
          </p>
        </header>

        <BusinessVerificationDesktopForm
          query={form.query}
          searchResults={form.searchResults}
          isSearching={form.isSearching}
          place={form.place}
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

        <div className="flex flex-col gap-[16px]">
          {error != null && (
            <p
              role="alert"
              className="text-center text-[16px] leading-[normal] text-[#e5484d]"
            >
              {getBusinessVerificationErrorMessage(error)}
            </p>
          )}
          <button
            type="button"
            disabled={isSubmitDisabled}
            onClick={handleSubmitClick}
            className="bg-main-5 flex h-[61px] w-full items-center justify-center rounded-[12px] text-[24px] font-semibold text-[#f9f9f9] disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
          >
            {isPending ? '인증 중...' : '사업자 인증하기'}
          </button>
        </div>
      </div>

      <BusinessVerificationConfirmDialog
        isOpen={isConfirmOpen && form.place !== null}
        scale={DIALOG_SCALE}
        placeName={form.place?.title ?? ''}
        placeAddress={form.businessAddress}
        onConfirm={handleConfirm}
        onReselect={handleReselect}
        onClose={() => setIsConfirmOpen(false)}
      />
      <BusinessVerificationSuccessDialog
        isOpen={isVerified}
        scale={DIALOG_SCALE}
        onConfirm={onSuccessConfirm}
      />
    </DesktopPageShell>
  );
}
