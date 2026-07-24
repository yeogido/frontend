import PhotoSlot from './PhotoSlot';
import { MAX_REVIEW_PHOTOS } from '../reviewForm';

interface SelectedPhotoSectionProps {
  photos: Array<{ file: File; previewUrl: string }>;
  onOpenPicker: () => void;
  onRemovePhoto: (index: number) => void;
}

const PHOTO_SLOTS = Array.from({ length: MAX_REVIEW_PHOTOS }, (_, index) => ({
  id: index + 1,
  label: `사진 ${index + 1} 추가`,
}));

function SelectedPhotoSection({
  photos,
  onOpenPicker,
  onRemovePhoto,
}: SelectedPhotoSectionProps) {
  const isFull = photos.length >= MAX_REVIEW_PHOTOS;

  return (
    <section className="mt-[34px]" aria-labelledby="selected-photo-title">
      <div className="flex items-center justify-between">
        <h2 id="selected-photo-title" className="text-base leading-6 font-medium">
          선택된 사진{' '}
          <span className="text-gray-4">
            ({photos.length}/{MAX_REVIEW_PHOTOS})
          </span>
        </h2>
        <p className="text-gray-3 text-[11px] leading-4">
          최대 {MAX_REVIEW_PHOTOS}장까지 선택할 수 있어요.
        </p>
      </div>

      <div className="mt-[5px] grid grid-cols-5 gap-4">
        {PHOTO_SLOTS.map((slot, index) => {
          const photo = photos[index];

          return (
            <PhotoSlot
              key={slot.id}
              label={slot.label}
              previewUrl={photo?.previewUrl}
              onClick={photo || isFull ? undefined : onOpenPicker}
              onRemove={photo ? () => onRemovePhoto(index) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}

export default SelectedPhotoSection;
