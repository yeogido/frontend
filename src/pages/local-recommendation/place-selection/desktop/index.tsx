import { getCourseDayLabel } from '../../../../utils/courseDetail';
import DesktopResultRow, {
  DesktopSelectedRow,
} from '../../desktop/DesktopResultRow';
import DesktopSearchField from '../../desktop/DesktopSearchField';
import DesktopSelectedPanel from '../../desktop/DesktopSelectedPanel';
import DesktopSelectionLayout from '../../desktop/DesktopSelectionLayout';
import { usePlaceSelectionPage } from '../usePlaceSelectionPage';
import PlacePhotoDesktopModal from './PlacePhotoDesktopModal';

/**
 * 장소 등록 — 데스크톱 뷰(Figma 6346:91192 / 6346:91571, 사진 추가 6346:91365).
 *
 * 검색·선택·사진 모달 흐름은 usePlaceSelectionPage를 모바일과 같이 쓰고,
 * 선택 시트는 오른쪽 패널, 사진 추가는 가운데 모달로 바뀐다.
 */
function PlaceSelectionDesktopPage() {
  const {
    day,
    setQuery,
    searchResults,
    isLoading,
    hasError,
    selectedPlaces,
    selectedPlaceIds,
    removeSelectedPlace,
    removeAllSelectedPlaces,
    photoModal,
    handleConfirmImage,
    handleSubmitPlaces,
  } = usePlaceSelectionPage();
  const {
    pendingPlace,
    pendingImagePreviewUrl,
    isImageModalOpen,
    handlePlaceAdd,
    closeImageModal,
    handleImageFileChange,
  } = photoModal;
  const hasSelected = selectedPlaces.length > 0;

  return (
    <>
      <DesktopSelectionLayout
        title={
          <>
            <span className="text-main-5">{getCourseDayLabel(day)}</span>에
            방문할 장소를 등록해 주세요
          </>
        }
        description="코스에 등록할 장소를 검색해 보세요"
        search={
          <DesktopSearchField
            placeholder="장소명을 검색해 주세요"
            label="장소명 검색"
            onQueryChange={setQuery}
          />
        }
        statusMessage={
          isLoading ? (
            <p role="status">검색 중입니다.</p>
          ) : hasError ? (
            <p role="alert">
              검색하지 못했습니다. 검색어를 다시 입력해 주세요.
            </p>
          ) : null
        }
        results={searchResults.map((place) => (
          <DesktopResultRow
            key={place.id}
            visual="marker"
            title={place.title}
            description={place.address}
            disabled={selectedPlaceIds.has(place.id)}
            onAdd={() => handlePlaceAdd(place)}
          />
        ))}
        panel={
          <DesktopSelectedPanel
            title="추가된 장소"
            emptyMessage="아직 추가된 장소가 없어요"
            isEmpty={!hasSelected}
            onRemoveAll={removeAllSelectedPlaces}
            submitLabel="장소 등록하기"
            isSubmitDisabled={!hasSelected}
            onSubmit={handleSubmitPlaces}
          >
            {selectedPlaces.map((place) => (
              <DesktopSelectedRow
                key={place.id}
                title={place.title}
                description={place.address}
                imageSrc={place.imagePreviewUrl}
                onRemove={() => removeSelectedPlace(place)}
              />
            ))}
          </DesktopSelectedPanel>
        }
      />

      {isImageModalOpen && pendingPlace ? (
        <PlacePhotoDesktopModal
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

export default PlaceSelectionDesktopPage;
