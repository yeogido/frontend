import { IoClose } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const SLOT_RADIUS = 12;
const PLACEHOLDER_BAR_LENGTH = 18;
const PLACEHOLDER_BAR_THICKNESS = 1.5;
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
    <div className="relative aspect-square w-full max-w-14">
      <button
        type="button"
        aria-label={previewUrl ? `선택한 ${label}` : label}
        onClick={onClick}
        disabled={Boolean(previewUrl && !onClick)}
        className="bg-gray-2 relative size-full overflow-hidden disabled:cursor-default"
        style={{ borderRadius: SLOT_RADIUS * scale }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <>
            <span
              className="bg-gray-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                height: PLACEHOLDER_BAR_THICKNESS * scale,
                width: PLACEHOLDER_BAR_LENGTH * scale,
              }}
            />
            <span
              className="bg-gray-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                height: PLACEHOLDER_BAR_LENGTH * scale,
                width: PLACEHOLDER_BAR_THICKNESS * scale,
              }}
            />
          </>
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
          className="absolute flex items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          style={{
            top: -6 * scale + removeOverlap,
            right: -6 * scale + removeOverlap,
            width: removeButtonSize,
            height: removeButtonSize,
          }}
        >
          <IoClose
            aria-hidden="true"
            style={{ fontSize: REMOVE_ICON_SIZE * scale }}
          />
        </button>
      )}
    </div>
  );
}

export default PhotoSlot;
