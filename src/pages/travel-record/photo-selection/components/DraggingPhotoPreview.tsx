import { createPortal } from 'react-dom';

import { getDraggingPhotoPreviewPosition } from '../draggingPhotoPreviewPosition';

interface DraggingPhotoPreviewProps {
  draggingPhoto: {
    url: string;
    offsetX: number;
    offsetY: number;
    pointerX: number;
    pointerY: number;
    width: number;
    height: number;
  } | null;
}

function DraggingPhotoPreview({ draggingPhoto }: DraggingPhotoPreviewProps) {
  if (!draggingPhoto) {
    return null;
  }

  const position = getDraggingPhotoPreviewPosition(draggingPhoto);

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 overflow-hidden rounded-xl shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
      style={{
        ...position,
        width: draggingPhoto.width,
        height: draggingPhoto.height,
      }}
    >
      <img
        src={draggingPhoto.url}
        alt=""
        draggable={false}
        className="size-full object-cover"
      />
    </div>,
    document.body,
  );
}

export default DraggingPhotoPreview;

