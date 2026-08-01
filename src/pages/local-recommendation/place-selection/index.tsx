import { useNavigate } from 'react-router-dom';

import PlacePhotoModal from './components/PlacePhotoModal';
import PlaceSearchSection from './components/PlaceSearchSection';
import SelectedPlaceSection from './components/SelectedPlaceSection';
import { usePlacePhotoModal } from './hooks/usePlacePhotoModal';
import { usePlaceSearch } from './hooks/usePlaceSearch';
import { useSelectedPlaces } from './hooks/useSelectedPlaces';

function PlaceSelectionPage() {
  const navigate = useNavigate();
  const { setQuery, searchResults } = usePlaceSearch();
  const {
    selectedPlaces,
    selectedPlaceIds,
    addSelectedPlace,
    removeSelectedPlace,
    removeAllSelectedPlaces,
  } = useSelectedPlaces();
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

  const handleConfirmImage = () => {
    if (!pendingPlace || !pendingImageFile || !pendingImagePreviewUrl) return;

    addSelectedPlace(pendingPlace, pendingImageFile, pendingImagePreviewUrl);
    clearModalState();
  };

  const handleSubmitPlaces = () => {
    navigate('/local-recommendation/visit-order-selection');
  };

  return (
    <>
      <PlaceSearchSection
        searchResults={searchResults}
        selectedPlaceIds={selectedPlaceIds}
        onSearchChange={setQuery}
        onItemAdd={handlePlaceAdd}
        onBack={() =>
          navigate('/local-recommendation/event-selection', { replace: true })
        }
      />
      <SelectedPlaceSection
        selectedPlaces={selectedPlaces}
        onItemRemove={removeSelectedPlace}
        onRemoveAll={removeAllSelectedPlaces}
        onSubmit={handleSubmitPlaces}
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

export default PlaceSelectionPage;
