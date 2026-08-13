import SelectedItemsSheet from '../../components/SelectedItemsSheet';
import SelectionResultCard from '../../components/SelectionResultCard';
import type { SelectedPlace } from '../types';

interface SelectedPlaceSectionProps {
  selectedPlaces: SelectedPlace[];
  isUploading?: boolean;
  onItemRemove: (place: SelectedPlace) => void;
  onRemoveAll: () => void;
  onSubmit: () => void;
}

function SelectedPlaceSection({
  selectedPlaces,
  isUploading = false,
  onItemRemove,
  onRemoveAll,
  onSubmit,
}: SelectedPlaceSectionProps) {
  return (
    <SelectedItemsSheet
      selectedSectionTitle="추가된 장소"
      emptyMessage="아직 추가된 장소가 없어요"
      submitButtonLabel={isUploading ? '사진 업로드 중...' : '장소 등록하기'}
      selectedItems={selectedPlaces}
      isSubmitDisabled={selectedPlaces.length === 0 || isUploading}
      onItemRemove={onItemRemove}
      onRemoveAll={onRemoveAll}
      onSubmit={onSubmit}
      renderItem={(place, onItemRemove) => (
        <SelectionResultCard
          key={place.id}
          item={place}
          title={place.title}
          description={place.address}
          imageSrc={place.imagePreviewUrl}
          imageAlt={`${place.title} 장소 이미지`}
          visual={place.imagePreviewUrl ? 'photo' : 'marker'}
          action="remove"
          onItemRemove={onItemRemove}
        />
      )}
    />
  );
}

export default SelectedPlaceSection;
