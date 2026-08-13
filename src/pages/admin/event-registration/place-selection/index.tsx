import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import SelectionPageLayout from '../../../local-recommendation/components/SelectionPageLayout';
import SelectedItemsSheet from '../../../local-recommendation/components/SelectedItemsSheet';
import SelectionResultCard from '../../../local-recommendation/components/SelectionResultCard';
import type { PlaceItem } from '../../../local-recommendation/place-selection/types';
import { usePlaceSearch } from '../../../local-recommendation/place-selection/hooks/usePlaceSearch';
import { usePlacePhotos } from '../../../../hooks/usePlacePhotos';
import { useAdminEventRegistrationStore } from '../../../../store/adminEventRegistration.store';

function AdminPlaceSelectionPage() {
  const navigate = useNavigate();
  const place = useAdminEventRegistrationStore((state) => state.place);
  const setPlace = useAdminEventRegistrationStore((state) => state.setPlace);
  const setPlaceSource = useAdminEventRegistrationStore(
    (state) => state.setPlaceSource
  );
  const { setQuery, searchResults } = usePlaceSearch();
  const placePhotos = usePlacePhotos(
    searchResults.map((item) => ({
      id: item.id,
      name: item.title,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
    }))
  );
  const searchResultsWithPhotos = useMemo(
    () =>
      searchResults.map((item) => ({
        ...item,
        imageSrc: placePhotos.get(item.id)?.photoUri ?? item.imageSrc,
      })),
    [searchResults, placePhotos]
  );

  // 여기 검색 결과는 항상 실제 카카오 검색이라, 수정 진입 때 상세 조회로
  // 채워졌을 수 있는 placeSource(TOUR_API 등)를 새로 고른 장소 기준으로
  // 덮어써야 한다 — 안 그러면 카카오로 새로 고른 장소가 예전 출처로 전송된다.
  const handlePlaceAdd = (item: PlaceItem) => {
    setPlace(item);
    setPlaceSource('KAKAO');
  };

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
        items={searchResultsWithPhotos}
        selectedItemIds={selectedPlaceIds}
        getItemId={(item) => item.id}
        onSearchChange={setQuery}
        onQueryChange={setQuery}
        onItemAdd={handlePlaceAdd}
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
