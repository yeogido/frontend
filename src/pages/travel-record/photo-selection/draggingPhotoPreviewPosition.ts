interface DraggingPhotoPreviewPointer {
  pointerX: number;
  pointerY: number;
  offsetX: number;
  offsetY: number;
}

export function getDraggingPhotoPreviewPosition({
  pointerX,
  pointerY,
  offsetX,
  offsetY,
}: DraggingPhotoPreviewPointer) {
  return {
    left: pointerX - offsetX,
    top: pointerY - offsetY,
  };
}
