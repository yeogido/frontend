import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SelectionPageLayout from '../components/SelectionPageLayout';
import SelectionResultCard from '../components/SelectionResultCard';
import SelectedItemsSheet from '../components/SelectedItemsSheet';
import PlacePhotoModal from './components/PlacePhotoModal';
import { referencePlaces } from './constants/referencePlaces';
import { filterPlaceItems } from './placeSearch';
import type { PlaceItem, SelectedPlace } from './types';

const placeSearchSuggestions = referencePlaces.map((place) => place.title);

function PlaceSelectionPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);
  const [pendingPlace, setPendingPlace] = useState<PlaceItem | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreviewUrl, setPendingImagePreviewUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const pendingImagePreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingImagePreviewUrlRef.current) {
        URL.revokeObjectURL(pendingImagePreviewUrlRef.current);
      }
    };
  }, []);

  const searchResults = useMemo(
    () => filterPlaceItems(referencePlaces, query),
    [query]
  );
  const selectedPlaceIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const handlePlaceAdd = (place: PlaceItem) => {
    setPendingPlace(place);
    setIsImageModalOpen(true);
  };

  const clearPendingImage = () => {
    if (pendingImagePreviewUrlRef.current) {
      URL.revokeObjectURL(pendingImagePreviewUrlRef.current);
      pendingImagePreviewUrlRef.current = null;
    }

    setPendingImageFile(null);
    setPendingImagePreviewUrl(null);
  };

  const closeImageModal = () => {
    clearPendingImage();
    setPendingPlace(null);
    setIsImageModalOpen(false);
  };

  const handleImageFileChange = (file: File) => {
    clearPendingImage();

    const previewUrl = URL.createObjectURL(file);
    pendingImagePreviewUrlRef.current = previewUrl;
    setPendingImageFile(file);
    setPendingImagePreviewUrl(previewUrl);
  };

  const handleConfirmImage = () => {
    if (!pendingPlace || !pendingImageFile || !pendingImagePreviewUrl) {
      return;
    }

    setSelectedPlaces((items) => [
      ...items,
      {
        ...pendingPlace,
        imageFile: pendingImageFile,
        imagePreviewUrl: pendingImagePreviewUrl,
      },
    ]);
    pendingImagePreviewUrlRef.current = null;
    setPendingPlace(null);
    setPendingImageFile(null);
    setPendingImagePreviewUrl(null);
    setIsImageModalOpen(false);
  };

  const removeSelectedPlace = (place: SelectedPlace) => {
    URL.revokeObjectURL(place.imagePreviewUrl);
    setSelectedPlaces((items) => items.filter((item) => item.id !== place.id));
  };

  const removeAllSelectedPlaces = () => {
    selectedPlaces.forEach((place) => URL.revokeObjectURL(place.imagePreviewUrl));
    setSelectedPlaces([]);
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
        isSubmitDisabled={selectedPlaces.length === 0}
        onItemRemove={removeSelectedPlace}
        onRemoveAll={removeAllSelectedPlaces}
        onSubmit={() => undefined}
        renderItem={(place, onItemRemove) => (
          <SelectionResultCard
            key={place.id}
            item={place}
            title={place.title}
            description={place.address}
            imageSrc={place.imagePreviewUrl}
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

export default PlaceSelectionPage;
