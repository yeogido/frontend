import type { PointerEvent } from 'react';

import addIcon from '../assets/photo-add-icon.svg';
import removeIcon from '../../region-selection/assets/material-symbols_close-rounded.svg';
import type { SelectedPhoto } from '../types';
import { MAX_PHOTO_COUNT } from '../photoValidation';

interface DraggingPhotoState {
  id: string;
  targetId: string | null;
}

interface SelectedPhotoStripProps {
  draggingPhoto: DraggingPhotoState | null;
  photos: SelectedPhoto[];
  onPhotoPointerDown: (
    event: PointerEvent<HTMLDivElement>,
    photo: SelectedPhoto,
  ) => void;
  onPhotoPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPhotoPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onRegisterPhotoItem: (photoId: string, node: HTMLDivElement | null) => void;
  onRemovePhoto: (photo: SelectedPhoto) => void;
}

const selectedPhotosTitle = '\uC120\uD0DD\uB41C \uC0AC\uC9C4';
const maxPhotoHelperText =
  '\uCD5C\uB300 5\uC7A5\uAE4C\uC9C0 \uC120\uD0DD\uD560 \uC218 \uC788\uC5B4\uC694';

function SelectedPhotoStrip({
  draggingPhoto,
  photos,
  onPhotoPointerDown,
  onPhotoPointerMove,
  onPhotoPointerUp,
  onRegisterPhotoItem,
  onRemovePhoto,
}: SelectedPhotoStripProps) {
  return (
    <section
      aria-labelledby="selected-photos-title"
      className="absolute top-[482px] left-6 flex w-[342px] flex-col gap-3"
    >
      <div className="flex items-center justify-between leading-none">
        <div className="flex items-center gap-1 text-[16px]">
          <h2
            id="selected-photos-title"
            className="font-semibold text-[#1c1c1c]"
          >
            {selectedPhotosTitle}
          </h2>
          <span className="font-medium text-[#7f7f7f]" aria-live="polite">
            ({photos.length}/{MAX_PHOTO_COUNT})
          </span>
        </div>
        <p className="text-[12px] text-[#7f7f7f]">
          {maxPhotoHelperText}
        </p>
      </div>

      <div className="flex w-full items-center justify-between">
        {Array.from({ length: MAX_PHOTO_COUNT }).map((_, index) => {
          const photo = photos[index];

          if (photo) {
            const photoNumber = index + 1;

            return (
              <div
                key={photo.id}
                data-photo-id={photo.id}
                ref={(node) => onRegisterPhotoItem(photo.id, node)}
                onPointerDown={(event) => onPhotoPointerDown(event, photo)}
                onPointerMove={onPhotoPointerMove}
                onPointerUp={onPhotoPointerUp}
                onPointerCancel={onPhotoPointerUp}
                className={`relative size-14 touch-none overflow-visible rounded-xl bg-[#e4e4e4] transition-transform ${
                  draggingPhoto?.id === photo.id
                    ? 'cursor-grabbing opacity-35'
                    : 'cursor-grab'
                } ${
                  draggingPhoto?.targetId === photo.id
                    ? 'scale-105 ring-2 ring-[#ff6f41] ring-offset-2 ring-offset-[#f9f9f9]'
                    : ''
                }`}
              >
                <img
                  src={photo.url}
                  alt={`${selectedPhotosTitle} ${photoNumber}`}
                  draggable={false}
                  className="size-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onRemovePhoto(photo)}
                  aria-label={`${selectedPhotosTitle} ${photoNumber} \uC0AD\uC81C`}
                  className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[#f9f9f9] shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
                >
                  <img
                    src={removeIcon}
                    alt=""
                    aria-hidden="true"
                    className="size-4"
                  />
                </button>
              </div>
            );
          }

          return (
            <span
              key={`empty-photo-slot-${index}`}
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-xl bg-[#e4e4e4]"
            >
              <img src={addIcon} alt="" aria-hidden="true" className="size-6" />
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default SelectedPhotoStrip;
