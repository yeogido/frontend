import { useGlobalScale } from '../../../hooks/useGlobalScale';

import PhotoSlot from './PhotoSlot';
import { MAX_REVIEW_PHOTOS } from '../reviewForm';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 34;
const TITLE_FONT_SIZE = 16;
const TITLE_LINE_HEIGHT = 24;
const HELPER_FONT_SIZE = 11;
const HELPER_LINE_HEIGHT = 16;
const GRID_MARGIN_TOP = 12;
const GRID_GAP = 16;

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
  const scale = useGlobalScale();

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="selected-photo-title"
    >
      <div className="flex items-center justify-between">
        <h2
          id="selected-photo-title"
          className="font-semibold"
          style={{
            fontSize: TITLE_FONT_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          선택된 사진{' '}
          <span className="text-gray-4">
            ({photos.length}/{MAX_REVIEW_PHOTOS})
          </span>
        </h2>
        <p
          className="text-gray-3"
          style={{
            fontSize: HELPER_FONT_SIZE * scale,
            lineHeight: `${HELPER_LINE_HEIGHT * scale}px`,
          }}
        >
          최대 {MAX_REVIEW_PHOTOS}장까지 선택할 수 있어요.
        </p>
      </div>

      <div
        className="grid grid-cols-5"
        style={{ marginTop: GRID_MARGIN_TOP * scale, gap: GRID_GAP * scale }}
      >
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
