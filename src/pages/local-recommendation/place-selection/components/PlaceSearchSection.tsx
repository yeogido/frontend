import SelectionPageLayout from '../../components/SelectionPageLayout';
import SelectionResultCard from '../../components/SelectionResultCard';
import type { PlaceItem } from '../types';

const placeSearchSuggestions: readonly string[] = [];

interface PlaceSearchSectionProps {
  searchResults: PlaceItem[];
  selectedPlaceIds: Set<string>;
  onSearchChange: (query: string) => void;
  onItemAdd: (place: PlaceItem) => void;
  onBack: () => void;
}

function PlaceSearchSection({
  searchResults,
  selectedPlaceIds,
  onSearchChange,
  onItemAdd,
  onBack,
}: PlaceSearchSectionProps) {
  return (
    <SelectionPageLayout
      title={
        <>
          코스에
          <br />
          장소를 등록해 주세요
        </>
      }
      description="코스에 등록할 장소를 검색해 보세요"
      searchPlaceholder="장소명을 검색해 주세요"
      searchLabel="장소명 검색"
      searchSuggestions={placeSearchSuggestions}
      items={searchResults}
      selectedItemIds={selectedPlaceIds}
      getItemId={(place) => place.id}
      onSearchChange={onSearchChange}
      onItemAdd={onItemAdd}
      onBack={onBack}
      renderItem={(place, isSelected, onItemAdd) => (
        <SelectionResultCard
          key={place.id}
          item={place}
          title={place.title}
          description={place.address}
          imageSrc={place.imageSrc}
          imageAlt={`${place.title} 장소 이미지`}
          action="add"
          disabled={isSelected}
          onItemAdd={onItemAdd}
        />
      )}
    />
  );
}

export default PlaceSearchSection;
