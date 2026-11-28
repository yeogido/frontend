import type { ReactNode } from 'react';

import type { BusinessInfoResponse } from '../../../../types/business.type';
import { DesktopSelectedRow } from '../../../local-recommendation/desktop/DesktopResultRow';
import DesktopSelectedPanel from '../../../local-recommendation/desktop/DesktopSelectedPanel';
import DesktopStepLayout from '../../components/DesktopStepLayout';
import BusinessDesktopRow from './BusinessDesktopRow';

// Figma 1440 데스크톱 시안(7193:17718) 기준 리터럴 px: 1042 = 608 + 74 + 360.
// 목록은 남는 폭을 쓴다 — 고정폭이면 1024px 창에서 패널과의 간격이 사라진다.
const CONTENT_WIDTH = 1042;
const PANEL_WIDTH = 360;

interface PlaceSelectionDesktopViewProps {
  readonly businesses: readonly BusinessInfoResponse[];
  readonly selectedBusiness: BusinessInfoResponse | null;
  readonly statusMessage?: ReactNode;
  /** 인증한 사업장이 전부 홍보 중이라 고를 수 있는 사업장이 없다. */
  readonly allPromoting?: boolean;
  /** 고른 사업장이 있어도 제출을 막아야 할 때(그새 홍보 중이 된 경우). */
  readonly isSubmitBlocked?: boolean;
  readonly onSelect: (business: BusinessInfoResponse) => void;
  readonly onSelectedBusinessChange: (
    business: BusinessInfoResponse | null
  ) => void;
  readonly onSubmit: () => void;
  readonly onBack: () => void;
}

/** 사업장 선택 — 왼쪽 목록에서 하나를 골라 오른쪽 패널에 담는다. */
function PlaceSelectionDesktopView({
  businesses,
  selectedBusiness,
  statusMessage,
  allPromoting = false,
  isSubmitBlocked = false,
  onSelect,
  onSelectedBusinessChange,
  onSubmit,
  onBack,
}: PlaceSelectionDesktopViewProps) {
  return (
    <DesktopStepLayout
      contentWidth={CONTENT_WIDTH}
      title="홍보하고 싶은 사업장을 선택해주세요"
      description="사업자 인증이 완료된 사업장만 표시됩니다"
      onBack={onBack}
    >
      <div className="mt-[24px] flex items-start gap-[74px]">
        <section aria-label="내 사업장 목록" className="min-w-0 flex-1">
          {statusMessage ? (
            <p className="text-gray-5 text-[16px]">{statusMessage}</p>
          ) : null}
          <ul className="flex flex-col gap-[20px]">
            {businesses.map((business) => (
              <BusinessDesktopRow
                key={business.businessInfoId}
                business={business}
                isSelected={
                  selectedBusiness?.businessInfoId === business.businessInfoId
                }
                onAdd={onSelect}
              />
            ))}
          </ul>
        </section>

        <div className="shrink-0" style={{ width: PANEL_WIDTH }}>
          <DesktopSelectedPanel
            title="선택한 사업장"
            emptyMessage={
              allPromoting
                ? '인증한 사업장이 모두 홍보 중이에요'
                : '아직 추가된 장소가 없어요'
            }
            removeAllLabel="삭제"
            isEmpty={selectedBusiness === null}
            onRemoveAll={() => onSelectedBusinessChange(null)}
            submitLabel="다음"
            isSubmitDisabled={selectedBusiness === null || isSubmitBlocked}
            onSubmit={onSubmit}
          >
            {selectedBusiness ? (
              <DesktopSelectedRow
                title={selectedBusiness.businessName}
                description={selectedBusiness.businessAddress}
                onRemove={() => onSelectedBusinessChange(null)}
              />
            ) : null}
          </DesktopSelectedPanel>
        </div>
      </div>
    </DesktopStepLayout>
  );
}

export default PlaceSelectionDesktopView;
