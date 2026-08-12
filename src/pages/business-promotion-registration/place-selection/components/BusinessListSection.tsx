import type { ReactNode } from 'react';

import type { BusinessInfoResponse } from '../../../../types/business.type';

import SelectionPageLayout from './SelectionPageLayout';
import SelectionResultCard from './SelectionResultCard';

interface BusinessListSectionProps {
  businesses: BusinessInfoResponse[];
  selectedBusinessId: string | null;
  statusMessage?: ReactNode;
  onItemAdd: (business: BusinessInfoResponse) => void;
  onBack: () => void;
}

function BusinessListSection({
  businesses,
  selectedBusinessId,
  statusMessage,
  onItemAdd,
  onBack,
}: BusinessListSectionProps) {
  return (
    <SelectionPageLayout
      title={
        <>
          홍보하고 싶은
          <br />
          사업장을 선택해주세요
        </>
      }
      description="사업자 인증이 완료된 사업장만 표시됩니다"
      items={businesses}
      selectedItemIds={
        selectedBusinessId ? new Set([selectedBusinessId]) : new Set()
      }
      getItemId={(business) => String(business.businessInfoId)}
      onItemAdd={onItemAdd}
      onBack={onBack}
      statusMessage={statusMessage}
      renderItem={(business, isSelected, onItemAdd) => (
        <SelectionResultCard
          key={business.businessInfoId}
          item={business}
          title={business.businessName}
          description={business.businessAddress}
          imageSrc={null}
          imageAlt={`${business.businessName} 사업장 이미지`}
          visual="marker"
          action="add"
          disabled={isSelected}
          onItemAdd={onItemAdd}
        />
      )}
    />
  );
}

export default BusinessListSection;
