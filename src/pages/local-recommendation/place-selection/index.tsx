import { useState } from 'react';
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

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleConfirmImage = async () => {
    if (!pendingPlace || !pendingImageFile || !pendingImagePreviewUrl) {
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      await addSelectedPlace(
        pendingPlace,
        pendingImageFile,
        pendingImagePreviewUrl
      );
      clearModalState();
    } catch {
      setUploadError('사진 업로드에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsUploading(false);
    }
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
        onSubmit={() => navigate('/local-recommendation/visit-order-selection')}
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
      {isUploading ? (
        <p
          role="status"
          className="text-gray-5 fixed bottom-4 left-1/2 z-[10001] -translate-x-1/2 text-sm"
        >
          사진 업로드 중...
        </p>
      ) : null}
      {uploadError ? (
        <p
          role="alert"
          className="text-main-5 fixed bottom-4 left-1/2 z-[10001] -translate-x-1/2 text-sm"
        >
          {uploadError}
        </p>
      ) : null}
    </>
  );
}

export default PlaceSelectionPage;
