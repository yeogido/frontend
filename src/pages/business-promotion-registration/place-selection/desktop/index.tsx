import type { ReactNode } from 'react';

import type { BusinessInfoResponse } from '../../../../types/business.type';
import DesktopResultRow, {
  DesktopSelectedRow,
} from '../../../local-recommendation/desktop/DesktopResultRow';
import DesktopSelectedPanel from '../../../local-recommendation/desktop/DesktopSelectedPanel';
import DesktopStepLayout from '../../components/DesktopStepLayout';

// Figma 1440 데스크톱 시안(7193:17718) 기준 리터럴 px: 1042 = 608 + 74 + 360
const CONTENT_WIDTH = 1042;
const LIST_WIDTH = 608;
const PANEL_WIDTH = 360;

interface PlaceSelectionDesktopViewProps {
  readonly businesses: readonly BusinessInfoResponse[];
  readonly selectedBusiness: BusinessInfoResponse | null;
  readonly statusMessage?: ReactNode;
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
      <div className="mt-[24px] flex items-start justify-between">
        <section
          aria-label="내 사업장 목록"
          className="min-w-0"
          style={{ width: LIST_WIDTH }}
        >
          {statusMessage ? (
            <p className="text-gray-5 text-[16px]">{statusMessage}</p>
          ) : null}
          <ul className="flex flex-col gap-[20px]">
            {businesses.map((business) => (
              <DesktopResultRow
                key={business.businessInfoId}
                title={business.businessName}
                description={business.businessAddress}
                visual="photo"
                disabled={
                  selectedBusiness?.businessInfoId === business.businessInfoId
                }
                onAdd={() => onSelectedBusinessChange(business)}
              />
            ))}
          </ul>
        </section>

        <div className="shrink-0" style={{ width: PANEL_WIDTH }}>
          <DesktopSelectedPanel
            title="선택한 사업장"
            emptyMessage="아직 추가된 장소가 없어요"
            removeAllLabel="삭제"
            isEmpty={selectedBusiness === null}
            onRemoveAll={() => onSelectedBusinessChange(null)}
            submitLabel="다음"
            isSubmitDisabled={selectedBusiness === null}
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
