import type { BusinessInfoResponse } from '../../../../types/business.type';

import SelectedItemsSheet from './SelectedItemsSheet';
import SelectionResultCard from './SelectionResultCard';

const EMPTY_MESSAGE = '아직 추가된 장소가 없어요';
const ALL_PROMOTING_MESSAGE = '인증한 사업장이 모두 홍보 중이에요';

interface SelectedBusinessSectionProps {
  selectedBusiness: BusinessInfoResponse | null;
  /** 인증한 사업장이 전부 홍보 중이라 고를 수 있는 사업장이 없다. */
  allPromoting?: boolean;
  /** 고른 사업장이 있어도 제출을 막아야 할 때(예: 그새 홍보 중이 된 경우). */
  isSubmitBlocked?: boolean;
  onRemove: () => void;
  onSubmit: () => void;
}

function SelectedBusinessSection({
  selectedBusiness,
  allPromoting = false,
  isSubmitBlocked = false,
  onRemove,
  onSubmit,
}: SelectedBusinessSectionProps) {
  const selectedItems = selectedBusiness ? [selectedBusiness] : [];

  return (
    <SelectedItemsSheet
      // Figma(606:3062): 고르기 전후 모두 "선택한 사업장"이다.
      selectedSectionTitle="선택한 사업장"
      emptyMessage={allPromoting ? ALL_PROMOTING_MESSAGE : EMPTY_MESSAGE}
      submitButtonLabel="다음으로"
      selectedItems={selectedItems}
      isSubmitDisabled={selectedBusiness === null || isSubmitBlocked}
      onItemRemove={onRemove}
      onRemoveAll={onRemove}
      onSubmit={onSubmit}
      renderItem={(business) => (
        <SelectionResultCard
          key={business.businessInfoId}
          item={business}
          title={business.businessName}
          description={business.businessAddress}
          imageSrc={null}
          imageAlt={`${business.businessName} 사업장 이미지`}
          visual="marker"
          action="remove"
          onItemRemove={onRemove}
        />
      )}
    />
  );
}

export default SelectedBusinessSection;
