import { useEffect, useMemo } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';

import { TravelRecordPageFrame } from '../components';
import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';

import {
  DraggingPhotoPreview,
  PhotoSelectionTip,
  PhotoUploadBox,
  SelectedPhotoStrip,
} from './components';
import { useDraggablePhotoOrder, useTravelRecordPhotoSelection } from './hooks';
import type { TravelPhotoSelectionLocationState } from '../date-selection/types';
import {
  getTravelRecordDraftDateRange,
  getTravelRecordDraftRegion,
} from '../utils/draftStorage';
import {
  saveTravelRecordPhotoDraft,
  TRAVEL_RECORD_PHOTO_DRAFT_ID,
} from '../utils/travelRecordSave';

const previousPageLabel =
  '\uC774\uC804 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30';
const titleFirstLine = '\uC5EC\uD589 \uC0AC\uC9C4\uC744';
const titleSecondLine = '\uCD94\uAC00\uD574 \uBCF4\uC138\uC694';
const description =
  '\uC5EC\uD589\uC758 \uC21C\uAC04\uC744 \uC0AC\uC9C4\uC73C\uB85C \uB0A8\uACA8\uBCF4\uC138\uC694';
const decorateFolderLabel = '\uD3F4\uB354 \uAFB8\uBBF8\uAE30';

function TravelRecordPhotoSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState =
    location.state as TravelPhotoSelectionLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const storedSelectedDateRange = useMemo(
    () => getTravelRecordDraftDateRange(),
    []
  );
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const selectedDateRange =
    locationState?.selectedDateRange ?? storedSelectedDateRange;
  const isEditing = useTravelRecordSessionStore((state) => state.editSession !== null);
  const {
    fileInputRef,
    hasSelectedPhotos,
    photos,
    photosRef,
    handlePhotoChange,
    openFilePicker,
    removePhoto,
    reorderPhotos,
  } = useTravelRecordPhotoSelection(isEditing);
  const {
    draggingPhoto,
    handlePhotoPointerDown,
    handlePhotoPointerMove,
    handlePhotoPointerUp,
    registerPhotoItem,
  } = useDraggablePhotoOrder({
    photosRef,
    onReorderPhotos: reorderPhotos,
  });

  const handleDecorateFolder = async () => {
    if (!hasSelectedPhotos || !selectedRegion || !selectedDateRange) {
      return;
    }

    await saveTravelRecordPhotoDraft(photos.map((photo) => photo.file));
    navigate('/travel-record/folder-decoration', {
      state: {
        selectedRegion,
        selectedDateRange,
        photoDraftId: TRAVEL_RECORD_PHOTO_DRAFT_ID,
      },
    });
  };

  useEffect(() => {
    if (!selectedRegion) {
      navigate('/travel-record/new', { replace: true });
      return;
    }

    if (!selectedDateRange) {
      navigate('/travel-record/date-selection', { replace: true });
    }
  }, [navigate, selectedDateRange, selectedRegion]);

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={previousPageLabel}
        className="absolute top-[60px] left-6 flex size-6 items-center justify-start text-[#505050]"
      >
        <IoChevronBack aria-hidden="true" className="text-[24px]" />
      </button>

      <section className="absolute top-[100px] left-6 flex flex-col gap-3">
        <h1 className="text-[32px] leading-none font-semibold text-[#1c1c1c]">
          {titleFirstLine}
          <br />
          {titleSecondLine}
        </h1>
        <p className="text-[14px] leading-none text-[#505050]">{description}</p>
      </section>

      <PhotoUploadBox
        fileInputRef={fileInputRef}
        hasSelectedPhotos={hasSelectedPhotos}
        onPhotoChange={handlePhotoChange}
        onUploadClick={openFilePicker}
      />

      <SelectedPhotoStrip
        draggingPhoto={draggingPhoto}
        photos={photos}
        onPhotoPointerDown={handlePhotoPointerDown}
        onPhotoPointerMove={handlePhotoPointerMove}
        onPhotoPointerUp={handlePhotoPointerUp}
        onRegisterPhotoItem={registerPhotoItem}
        onRemovePhoto={removePhoto}
      />

      <PhotoSelectionTip />
      <DraggingPhotoPreview draggingPhoto={draggingPhoto} />

      <button
        type="button"
        disabled={!hasSelectedPhotos}
        onClick={handleDecorateFolder}
        className="absolute top-[759px] left-6 flex h-[53px] w-[342px] items-center justify-center rounded-xl bg-[#e4e4e4] text-[18px] leading-none font-semibold text-[#7f7f7f] enabled:bg-[#ff6f41] enabled:text-[#f9f9f9]"
      >
        {decorateFolderLabel}
      </button>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordPhotoSelectionPage;
