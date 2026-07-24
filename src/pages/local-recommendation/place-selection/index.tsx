import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SelectionPageLayout from '../components/SelectionPageLayout';
import SelectionResultCard from '../components/SelectionResultCard';
import SelectedItemsSheet from '../components/SelectedItemsSheet';
import { referencePlaces } from './constants/referencePlaces';
import { filterPlaceItems } from './placeSearch';
import type { PlaceItem } from './types';

const placeSearchSuggestions = referencePlaces.map((place) => place.title);
const selectedPlaceIds = new Set<string>();
const selectedPlaces: PlaceItem[] = [];

function PlaceSelectionPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [, setPendingPlace] = useState<PlaceItem | null>(null);

  const searchResults = useMemo(
    () => filterPlaceItems(referencePlaces, query),
    [query]
  );

  const handlePlaceAdd = (place: PlaceItem) => {
    setPendingPlace(place);
  };

  return (
    <>
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
        onSearchChange={setQuery}
        onItemAdd={handlePlaceAdd}
        onBack={() => navigate('/local-recommendation/event-selection')}
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
      <SelectedItemsSheet
        selectedSectionTitle="추가된 장소"
        emptyMessage="아직 추가된 장소가 없어요"
        submitButtonLabel="장소 등록하기"
        selectedItems={selectedPlaces}
        isSubmitDisabled
        onItemRemove={() => undefined}
        onRemoveAll={() => undefined}
        onSubmit={() => undefined}
        renderItem={(place, onItemRemove) => (
          <SelectionResultCard
            key={place.id}
            item={place}
            title={place.title}
            description={place.address}
            imageSrc={place.imageSrc}
            imageAlt={`${place.title} 장소 이미지`}
            action="remove"
            onItemRemove={onItemRemove}
          />
        )}
      />
    </>
  );
}

export default PlaceSelectionPage;
