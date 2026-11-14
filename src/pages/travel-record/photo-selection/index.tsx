import { TravelRecordPageFrame } from '../components';

import {
  DraggingPhotoPreview,
  PhotoSelectionTip,
  PhotoUploadBox,
  SelectedPhotoStrip,
  TravelFolderPreview,
} from './components';
import { usePhotoSelectionPage } from './usePhotoSelectionPage';
import backIcon from '../../../assets/icons/back.svg';

const previousPageLabel =
  '\uC774\uC804 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30';
const titleFirstLine = '\uC5EC\uD589 \uC0AC\uC9C4\uC744';
const titleSecondLine = '\uCD94\uAC00\uD574 \uBCF4\uC138\uC694';
const description =
  '\uC5EC\uD589\uC758 \uC21C\uAC04\uC744 \uC0AC\uC9C4\uC73C\uB85C \uB0A8\uACA8\uBCF4\uC138\uC694';
const decorateFolderLabel = '\uD3F4\uB354 \uAFB8\uBBF8\uAE30';

function TravelRecordPhotoSelectionPage() {
  const {
    draggingPhoto,
    fileInputRef,
    hasSelectedPhotos,
    photos,
    regionName,
    handleDecorateFolder,
    handlePhotoChange,
    handlePhotoPointerDown,
    handlePhotoPointerMove,
    handlePhotoPointerUp,
    navigate,
    openFilePicker,
    registerPhotoItem,
    removePhoto,
  } = usePhotoSelectionPage();

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={previousPageLabel}
        className="absolute top-[60px] left-6 flex size-6 items-center justify-start text-[#505050]"
      >
        <img src={backIcon} alt="" aria-hidden="true" className="size-6" />
      </button>

      <section className="absolute top-[100px] left-6 flex flex-col gap-3">
        <h1 className="text-[32px] leading-none font-semibold text-[#1c1c1c]">
          {titleFirstLine}
          <br />
          {titleSecondLine}
        </h1>
        <p className="text-[14px] leading-none text-[#505050]">{description}</p>
      </section>

      {/* 업로드 박스가 사라져도 사진 추가 버튼이 동작해야 하므로 입력은
          페이지에 둔다. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handlePhotoChange}
        className="sr-only"
      />

      {hasSelectedPhotos ? (
        <TravelFolderPreview photos={photos} regionName={regionName} />
      ) : (
        <PhotoUploadBox onUploadClick={openFilePicker} />
      )}

      <SelectedPhotoStrip
        draggingPhoto={draggingPhoto}
        photos={photos}
        onPhotoPointerDown={handlePhotoPointerDown}
        onPhotoPointerMove={handlePhotoPointerMove}
        onPhotoPointerUp={handlePhotoPointerUp}
        onRegisterPhotoItem={registerPhotoItem}
        onRemovePhoto={removePhoto}
        onAddPhoto={openFilePicker}
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
