import { MdLock, MdPeople, MdPublic } from 'react-icons/md';
import type { IconType } from 'react-icons';

import closeRoundedIcon from '../../../../assets/icons/close-rounded.svg';
import type { TravelRecordApiVisibility } from '../../../../types/travelRecord.type';
import { TravelFolderArtwork } from '../../components';
import DraggingPhotoPreview from '../../photo-selection/components/DraggingPhotoPreview';
import photoAddIcon from '../../photo-selection/assets/photo-add-icon.svg';
import photoUploadIcon from '../../photo-selection/assets/photo-upload-icon.svg';
import {
  getFolderPreviewPhotoIds,
  getFolderPreviewPhotoUrls,
} from '../../photo-selection/folderPreviewPhotos';
import { MAX_PHOTO_COUNT } from '../../photo-selection/photoValidation';
import { usePhotoSelectionPage } from '../../photo-selection/usePhotoSelectionPage';
import { formatPeriodLabel } from '../../utils/formatPeriodLabel';
import CreateStepLayout from './CreateStepLayout';
import FolderPreviewCard from './FolderPreviewCard';

const VISIBILITY_OPTIONS: {
  value: TravelRecordApiVisibility;
  label: string;
  Icon: IconType;
}[] = [
  { value: 'PRIVATE', label: '나만 보기', Icon: MdLock },
  { value: 'FRIENDS', label: '친구 공개', Icon: MdPeople },
  { value: 'PUBLIC', label: '전체 공개', Icon: MdPublic },
];

/** Figma 6330:63867 — 여행 사진을 추가해 보세요. */
function PhotoSelectionDesktopPage() {
  const {
    draggingPhoto,
    fileInputRef,
    hasSelectedPhotos,
    isEditing,
    photos,
    regionName,
    selectedDateRange,
    visibility,
    handleDecorateFolder,
    handlePhotoChange,
    handlePhotoPointerDown,
    handlePhotoPointerMove,
    handlePhotoPointerUp,
    openFilePicker,
    registerPhotoItem,
    removePhoto,
    selectVisibility,
  } = usePhotoSelectionPage();

  return (
    <CreateStepLayout
      title="여행 사진을 추가해 보세요"
      description="여행의 순간을 사진으로 남겨보세요."
      actionLabel="폴더 꾸미기"
      actionDisabled={!hasSelectedPhotos}
      onAction={() => void handleDecorateFolder()}
      preview={
        <FolderPreviewCard
          art={
            <TravelFolderArtwork
              photos={getFolderPreviewPhotoUrls(photos)}
              photoKeys={getFolderPreviewPhotoIds(photos)}
              animatePhotoChanges
              title={regionName}
              decorations={[]}
            />
          }
          regionName={regionName}
          caption={
            selectedDateRange ? (
              <span className="text-gray-5 rounded-full bg-[#e4e4e4] px-[12px] py-[6px] text-[14px]">
                {formatPeriodLabel(
                  selectedDateRange.startDate,
                  selectedDateRange.endDate
                )}
              </span>
            ) : null
          }
        />
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handlePhotoChange}
        className="sr-only"
        aria-label="여행 사진 파일 선택"
      />

      <section
        aria-label="사진 업로드"
        className="border-main-5 bg-main-1 h-[219px] overflow-hidden rounded-[24px] border border-dashed"
      >
        <button
          type="button"
          onClick={openFilePicker}
          className="flex size-full flex-col items-center justify-center gap-[16px]"
        >
          <span className="bg-main-3 flex size-[51px] items-center justify-center rounded-full">
            <img src={photoUploadIcon} alt="" className="size-[32px]" />
          </span>
          <span className="flex flex-col items-center gap-[12px]">
            <span className="text-[16px] font-semibold text-black">
              사진을 추가해 주세요.
            </span>
            <span className="text-[14px] text-black">
              여기를 클릭해서 업로드할 수 있어요.
            </span>
          </span>
        </button>
      </section>

      <section aria-labelledby="selected-photos-title" className="mt-[32px]">
        <div className="flex items-center justify-between">
          <h2
            id="selected-photos-title"
            className="text-[16px] font-semibold text-black"
          >
            선택된 사진{' '}
            <span className="text-gray-4 font-medium" aria-live="polite">
              ({photos.length}/{MAX_PHOTO_COUNT})
            </span>
          </h2>
          <p className="text-gray-4 text-[14px]">
            최대 {MAX_PHOTO_COUNT}장까지 선택할 수 있어요.
          </p>
        </div>

        <ul className="mt-[20px] flex justify-between">
          {Array.from({ length: MAX_PHOTO_COUNT }, (_, index) => {
            const photo = photos[index];

            if (!photo) {
              return (
                <li key={`empty-${index}`}>
                  <button
                    type="button"
                    aria-label={`사진 ${index + 1} 추가`}
                    onClick={openFilePicker}
                    className="flex size-[106px] items-center justify-center rounded-[12px] bg-[#e4e4e4]"
                  >
                    <img src={photoAddIcon} alt="" className="size-[32px]" />
                  </button>
                </li>
              );
            }

            return (
              <li key={photo.id}>
                <div
                  data-photo-id={photo.id}
                  ref={(node) => registerPhotoItem(photo.id, node)}
                  onPointerDown={(event) =>
                    handlePhotoPointerDown(event, photo)
                  }
                  onPointerMove={handlePhotoPointerMove}
                  onPointerUp={handlePhotoPointerUp}
                  onPointerCancel={handlePhotoPointerUp}
                  className={`relative size-[106px] touch-none rounded-[12px] bg-[#e4e4e4] transition-transform ${
                    draggingPhoto?.id === photo.id
                      ? 'cursor-grabbing opacity-35'
                      : 'cursor-grab'
                  } ${
                    draggingPhoto?.targetId === photo.id
                      ? 'ring-main-5 scale-105 ring-2 ring-offset-2 ring-offset-white'
                      : ''
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`선택된 사진 ${index + 1}`}
                    draggable={false}
                    className="size-full rounded-[12px] object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`선택된 사진 ${index + 1} 삭제`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => removePhoto(photo)}
                    className="absolute -top-[6px] -right-[6px] flex size-[24px] items-center justify-center rounded-full bg-[#7f7f7f]/80 shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
                  >
                    <img
                      src={closeRoundedIcon}
                      alt=""
                      className="size-[16px] brightness-0 invert"
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 공개 범위는 새 기록을 만들 때만 정한다. 수정할 때는 상세 화면의 공유 설정에서 바꾼다. */}
      {isEditing ? null : (
        <section aria-labelledby="visibility-title" className="mt-[40px]">
          <h2
            id="visibility-title"
            className="text-[16px] font-semibold text-black"
          >
            공개범위 설정
          </h2>
          <div
            role="radiogroup"
            aria-labelledby="visibility-title"
            className="mt-[16px] grid grid-cols-3 gap-[15px]"
          >
            {VISIBILITY_OPTIONS.map(({ value, label, Icon }) => {
              const isSelected = visibility === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectVisibility(value)}
                  className={`flex h-[111px] flex-col items-center justify-center gap-[12px] rounded-[12px] border text-[14px] font-medium ${
                    isSelected
                      ? 'border-main-5 bg-main-1 text-main-5'
                      : 'border-gray-2 text-gray-5 bg-white'
                  }`}
                >
                  <Icon aria-hidden="true" className="text-[28px]" />
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <DraggingPhotoPreview draggingPhoto={draggingPhoto} />
    </CreateStepLayout>
  );
}

export default PhotoSelectionDesktopPage;
