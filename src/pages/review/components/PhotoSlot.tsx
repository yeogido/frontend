import closeIcon from '../../../assets/icons/close-rounded.svg';
import addIcon from '../../travel-record/photo-selection/assets/photo-add-icon.svg';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const SLOT_RADIUS = 12;
const ADD_ICON_SIZE = 24;
const REMOVE_VISUAL_SIZE = 20;
const REMOVE_ICON_SIZE = 12;

interface PhotoSlotProps {
  label: string;
  previewUrl?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

function PhotoSlot({ label, previewUrl, onClick, onRemove }: PhotoSlotProps) {
  const scale = useGlobalScale();
  const removeVisualSize = REMOVE_VISUAL_SIZE * scale;
  const removeButtonSize = Math.max(removeVisualSize, MIN_TOUCH_TARGET);
  const removeOverlap = (removeButtonSize - removeVisualSize) / -2;

  return (
    <div className="relative aspect-square w-full" style={{ maxWidth: 56 * scale }}>
      <button
        type="button"
        aria-label={previewUrl ? `선택한 ${label}` : label}
        onClick={onClick}
        disabled={Boolean(previewUrl && !onClick)}
        className="bg-gray-2 relative size-full overflow-hidden disabled:cursor-default"
        style={{ borderRadius: SLOT_RADIUS * scale }}
      >
        {previewUrl ? (
          <img
            key={previewUrl}
            src={previewUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <img
            key="add-photo"
            src={addIcon}
            alt=""
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: ADD_ICON_SIZE * scale, height: ADD_ICON_SIZE * scale }}
          />
        )}
      </button>

      {previewUrl && onRemove && (
        <button
          type="button"
          aria-label="사진 삭제"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute flex items-center justify-center"
          style={{
            top: -6 * scale + removeOverlap,
            right: -6 * scale + removeOverlap,
            width: removeButtonSize,
            height: removeButtonSize,
          }}
        >
          <span
            className="flex items-center justify-center rounded-full bg-[#7F7F7F]/80 shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
            style={{ width: removeVisualSize, height: removeVisualSize }}
          >
            <img
              src={closeIcon}
              alt=""
              aria-hidden="true"
              className="brightness-0 invert"
              style={{
                width: REMOVE_ICON_SIZE * scale,
                height: REMOVE_ICON_SIZE * scale,
              }}
            />
          </span>
        </button>
      )}
    </div>
  );
}

export default PhotoSlot;
