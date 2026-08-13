import type { BusinessInfoResponse } from '../../../../types/business.type';

import SelectedItemsSheet from './SelectedItemsSheet';
import SelectionResultCard from './SelectionResultCard';

interface SelectedBusinessSectionProps {
  selectedBusiness: BusinessInfoResponse | null;
  onRemove: () => void;
  onSubmit: () => void;
}

function SelectedBusinessSection({
  selectedBusiness,
  onRemove,
  onSubmit,
}: SelectedBusinessSectionProps) {
  const selectedItems = selectedBusiness ? [selectedBusiness] : [];

  return (
    <SelectedItemsSheet
      // Figma: 아직 선택 전엔 "선택한 사업장", 하나 고르고 나면 "추가된 장소"로 바뀐다.
      selectedSectionTitle={selectedBusiness ? '추가된 장소' : '선택한 사업장'}
      emptyMessage="아직 추가된 장소가 없어요"
      submitButtonLabel="다음으로"
      selectedItems={selectedItems}
      isSubmitDisabled={selectedBusiness === null}
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
