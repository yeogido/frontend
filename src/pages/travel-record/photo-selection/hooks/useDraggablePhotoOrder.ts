import {
  type RefObject,
  type PointerEvent,
  useRef,
  useState,
} from 'react';

import type { SelectedPhoto } from '../types';

interface DraggingPhoto {
  id: string;
  url: string;
  offsetX: number;
  offsetY: number;
  pointerX: number;
  pointerY: number;
  width: number;
  height: number;
  targetId: string | null;
}

interface UseDraggablePhotoOrderParams {
  photosRef: RefObject<SelectedPhoto[]>;
  onReorderPhotos: (sourcePhotoId: string, targetPhotoId: string) => void;
}

function useDraggablePhotoOrder({
  photosRef,
  onReorderPhotos,
}: UseDraggablePhotoOrderParams) {
  const photoItemRefs = useRef(new Map<string, HTMLDivElement>());
  const [draggingPhoto, setDraggingPhoto] = useState<DraggingPhoto | null>(
    null,
  );

  const registerPhotoItem = (photoId: string, node: HTMLDivElement | null) => {
    if (node) {
      photoItemRefs.current.set(photoId, node);
      return;
    }

    photoItemRefs.current.delete(photoId);
  };

  const handlePhotoPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    photo: SelectedPhoto,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingPhoto({
      id: photo.id,
      url: photo.url,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: rect.width,
      height: rect.height,
      targetId: null,
    });
  };

  const handlePhotoPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingPhoto) {
      return;
    }

    setDraggingPhoto((currentDraggingPhoto) => {
      if (!currentDraggingPhoto) {
        return null;
      }

      const targetPhoto = photosRef.current?.find((photo) => {
        if (photo.id === currentDraggingPhoto.id) {
          return false;
        }

        const element = photoItemRefs.current.get(photo.id);

        if (!element) {
          return false;
        }

        const rect = element.getBoundingClientRect();

        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });

      return {
        ...currentDraggingPhoto,
        pointerX: event.clientX,
        pointerY: event.clientY,
        targetId: targetPhoto?.id ?? null,
      };
    });
  };

  const handlePhotoPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (draggingPhoto?.targetId) {
      onReorderPhotos(draggingPhoto.id, draggingPhoto.targetId);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDraggingPhoto(null);
  };

  return {
    draggingPhoto,
    handlePhotoPointerDown,
    handlePhotoPointerMove,
    handlePhotoPointerUp,
    registerPhotoItem,
  };
}

export default useDraggablePhotoOrder;
