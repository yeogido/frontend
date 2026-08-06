import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import SelectedItemsSheet from '../../../local-recommendation/components/SelectedItemsSheet';
import SelectionPageLayout from '../../../local-recommendation/components/SelectionPageLayout';
import SelectionResultCard from '../../../local-recommendation/components/SelectionResultCard';
import PlacePhotoModal from '../../../local-recommendation/place-selection/components/PlacePhotoModal';
import { usePlacePhotoModal } from '../../../local-recommendation/place-selection/hooks/usePlacePhotoModal';
import { usePlaceSearch } from '../../../local-recommendation/place-selection/hooks/usePlaceSearch';
import type { AdminCoursePlaceItem } from '../types';

// Figma 390 디자인 기준 리터럴 px
const STATUS_MESSAGE_FONT_SIZE = 14;

function AdminCoursePlaceSelectionPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const selectedPlaces = useAdminCourseRegistrationStore(
    (state) => state.selectedPlaces
  );
  const setSelectedPlacesInStore = useAdminCourseRegistrationStore(
    (state) => state.setSelectedPlaces
  );
  const { query, setQuery, searchResults, isLoading, hasError } =
    usePlaceSearch();
  const trimmedQuery = query.trim();

  const statusMessage = useMemo(() => {
    if (!trimmedQuery) return null;
    if (isLoading) return '장소를 검색하고 있어요...';
    if (hasError) return '장소를 불러오지 못했어요. 다시 시도해 주세요.';
    if (searchResults.length === 0) return '검색 결과가 없어요.';
    return null;
  }, [trimmedQuery, isLoading, hasError, searchResults.length]);
  const {
    pendingPlace,
    pendingImageFile,
    pendingImagePreviewUrl,
    isImageModalOpen,
    handlePlaceAdd,
    closeImageModal,
    handleImageFileChange,
    clearModalState,
  } = usePlacePhotoModal();

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

  if (!region) return null;

  const selectedPlaceIds = new Set(selectedPlaces.map((place) => place.id));

  const handleConfirmImage = () => {
    if (!pendingPlace) return;

    if (selectedPlaces.some((item) => item.id === pendingPlace.id)) {
      if (pendingImagePreviewUrl) URL.revokeObjectURL(pendingImagePreviewUrl);
      clearModalState();
      return;
    }

    setSelectedPlacesInStore([
      ...selectedPlaces,
      {
        ...pendingPlace,
        photoFile: pendingImageFile,
        photoPreviewUrl: pendingImagePreviewUrl,
      },
    ]);
    clearModalState();
  };

  const handleRemovePlace = (place: AdminCoursePlaceItem) => {
    setSelectedPlacesInStore(
      selectedPlaces.filter((item) => item.id !== place.id)
    );
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
        searchSuggestions={[]}
        items={searchResults}
        selectedItemIds={selectedPlaceIds}
        getItemId={(place) => place.id}
        onSearchChange={setQuery}
        onQueryChange={setQuery}
        onItemAdd={handlePlaceAdd}
        onBack={() =>
          navigate('/admin/course-registration/event-selection', {
            replace: true,
          })
        }
        statusMessage={
          statusMessage ? (
            <p
              className="text-gray-5 text-center font-medium"
              style={{ fontSize: STATUS_MESSAGE_FONT_SIZE * scale }}
            >
              {statusMessage}
            </p>
          ) : undefined
        }
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
        isSubmitDisabled={selectedPlaces.length === 0}
        onItemRemove={handleRemovePlace}
        onRemoveAll={() => setSelectedPlacesInStore([])}
        onSubmit={() => navigate('/admin/course-registration/visit-order')}
        renderItem={(place, onItemRemove) => (
          <SelectionResultCard
            key={place.id}
            item={place}
            title={place.title}
            description={place.address}
            imageSrc={place.photoPreviewUrl}
            imageAlt={`${place.title} 장소 이미지`}
            action="remove"
            onItemRemove={onItemRemove}
          />
        )}
      />
      {isImageModalOpen && pendingPlace ? (
        <PlacePhotoModal
          placeTitle={pendingPlace.title}
          previewUrl={pendingImagePreviewUrl}
          onFileChange={handleImageFileChange}
          onClose={closeImageModal}
          onConfirm={handleConfirmImage}
        />
      ) : null}
    </>
  );
}

export default AdminCoursePlaceSelectionPage;
