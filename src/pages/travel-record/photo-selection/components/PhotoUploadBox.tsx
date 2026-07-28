import type { ChangeEvent, RefObject } from 'react';

import uploadIcon from '../assets/photo-upload-icon.svg';

interface PhotoUploadBoxProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  hasSelectedPhotos: boolean;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
}

const uploadAreaLabel = '\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC';
const addPhotoLabel =
  '\uC0AC\uC9C4\uC744 \uCD94\uAC00\uD574 \uC8FC\uC138\uC694';
const addMorePhotoLabel =
  '\uC0AC\uC9C4\uC744 \uB354 \uCD94\uAC00\uD560 \uC218 \uC788\uC5B4\uC694';
const uploadHelperText =
  '\uC5EC\uAE30\uB97C \uD0ED\uD574 \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694';

function PhotoUploadBox({
  fileInputRef,
  hasSelectedPhotos,
  onPhotoChange,
  onUploadClick,
}: PhotoUploadBoxProps) {
  return (
    <section
      aria-label={uploadAreaLabel}
      className="absolute top-[237px] left-6 h-[213px] w-[342px] overflow-hidden rounded-xl border border-dashed border-[#ff6f41] bg-[#fff7f5]"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onPhotoChange}
        className="sr-only"
      />
      <button
        type="button"
        onClick={onUploadClick}
        className="flex size-full items-center justify-center"
      >
        <span className="flex w-[161px] flex-col items-center gap-[18px]">
          <span className="flex size-[51px] items-center justify-center rounded-full bg-[#fbd0c2]">
            <img src={uploadIcon} alt="" aria-hidden="true" className="size-8" />
          </span>
          <span className="flex flex-col items-center gap-3 text-[#1c1c1c]">
            <span className="text-center text-[14px] leading-none font-semibold">
              {hasSelectedPhotos ? addMorePhotoLabel : addPhotoLabel}
            </span>
            <span className="text-[12px] leading-none">
              {uploadHelperText}
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}

export default PhotoUploadBox;
