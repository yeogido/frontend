interface DraggingPhotoPreviewProps {
  draggingPhoto: {
    url: string;
    offsetX: number;
    offsetY: number;
    pointerX: number;
    pointerY: number;
  } | null;
}

function DraggingPhotoPreview({ draggingPhoto }: DraggingPhotoPreviewProps) {
  if (!draggingPhoto) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 size-14 overflow-hidden rounded-xl shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
      style={{
        left: draggingPhoto.pointerX - draggingPhoto.offsetX,
        top: draggingPhoto.pointerY - draggingPhoto.offsetY,
      }}
    >
      <img
        src={draggingPhoto.url}
        alt=""
        draggable={false}
        className="size-full object-cover"
      />
    </div>
  );
}

export default DraggingPhotoPreview;

