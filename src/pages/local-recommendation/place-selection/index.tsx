import PlacePhotoModal from './components/PlacePhotoModal';
import PlaceSearchSection from './components/PlaceSearchSection';
import SelectedPlaceSection from './components/SelectedPlaceSection';
import { usePlaceSelectionPage } from './usePlaceSelectionPage';

function PlaceSelectionPage() {
  const {
    day,
    setQuery,
    searchResults,
    selectedPlaces,
    selectedPlaceIds,
    removeSelectedPlace,
    removeAllSelectedPlaces,
    photoModal,
    handleConfirmImage,
    handleSubmitPlaces,
    handleBack,
  } = usePlaceSelectionPage();
  const {
    pendingPlace,
    pendingImagePreviewUrl,
    isImageModalOpen,
    handlePlaceAdd,
    closeImageModal,
    handleImageFileChange,
  } = photoModal;

  return (
    <>
      <PlaceSearchSection
        searchResults={searchResults}
        selectedPlaceIds={selectedPlaceIds}
        day={day}
        onSearchChange={setQuery}
        onItemAdd={handlePlaceAdd}
        onBack={handleBack}
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
