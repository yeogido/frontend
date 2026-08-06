import { useNavigate } from 'react-router-dom';

import SelectionPageLayout from '../../../local-recommendation/components/SelectionPageLayout';
import SelectedItemsSheet from '../../../local-recommendation/components/SelectedItemsSheet';
import SelectionResultCard from '../../../local-recommendation/components/SelectionResultCard';
import { usePlaceSearch } from '../../../local-recommendation/place-selection/hooks/usePlaceSearch';
import { useAdminEventRegistrationStore } from '../../../../store/adminEventRegistration.store';

function AdminPlaceSelectionPage() {
  const navigate = useNavigate();
  const place = useAdminEventRegistrationStore((state) => state.place);
  const setPlace = useAdminEventRegistrationStore((state) => state.setPlace);
  const { setQuery, searchResults } = usePlaceSearch();

  const selectedPlaces = place ? [place] : [];
  const selectedPlaceIds = new Set(selectedPlaces.map((item) => item.id));

  return (
    <>
      <SelectionPageLayout
        title={
          <>
            행사가 진행되는
            <br />
            장소를 등록해 주세요
          </>
        }
        description="행사가 진행되는 장소를 검색해 보세요"
        searchPlaceholder="장소명을 검색해 주세요"
        searchLabel="장소명 검색"
        searchSuggestions={[]}
        hideEmptySearchSuggestions
        items={searchResults}
        selectedItemIds={selectedPlaceIds}
        getItemId={(item) => item.id}
        onSearchChange={setQuery}
        onQueryChange={setQuery}
        onItemAdd={setPlace}
        onBack={() => navigate('/admin', { replace: true })}
        renderItem={(item, isSelected, onItemAdd) => (
          <SelectionResultCard
            key={item.id}
            item={item}
            title={item.title}
            description={item.address}
            imageSrc={item.imageSrc}
            imageAlt={`${item.title} 장소 이미지`}
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
        isSubmitDisabled={selectedPlaces.length === 0}
        onItemRemove={() => setPlace(null)}
        onRemoveAll={() => setPlace(null)}
        onSubmit={() => navigate('/admin/event-registration/basic-info')}
        renderItem={(item, onItemRemove) => (
          <SelectionResultCard
            key={item.id}
            item={item}
            title={item.title}
            description={item.address}
            imageSrc={item.imageSrc}
            imageAlt={`${item.title} 장소 이미지`}
            action="remove"
            onItemRemove={onItemRemove}
          />
        )}
      />
    </>
  );
}

export default AdminPlaceSelectionPage;
