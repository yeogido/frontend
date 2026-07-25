import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import type { SelectedPhoto } from '../types';
import {
  MAX_PHOTO_COUNT,
  validateTravelRecordPhotos,
} from '../photoValidation';


function useTravelRecordPhotoSelection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<SelectedPhoto[]>([]);
  const photoUrlsRef = useRef<string[]>([]);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [message, setMessage] = useState('');
  const hasSelectedPhotos = photos.length > 0;

  useEffect(() => {
    photosRef.current = photos;
    photoUrlsRef.current = photos.map((photo) => photo.url);
  }, [photos]);

  useEffect(
    () => () => {
      photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  useEffect(() => {
    if (!message) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setMessage('');
    }, 2000);

    return () => window.clearTimeout(timerId);
  }, [message]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const remainingCount = MAX_PHOTO_COUNT - photosRef.current.length;
    const { files, message } = validateTravelRecordPhotos(
      selectedFiles,
      remainingCount,
    );
    const photosToAdd = files.map((file) => {
      const url = URL.createObjectURL(file);

      return {
        id: `${file.name}-${file.lastModified}-${url}`,
        file,
        url,
      };
    });

    setMessage(message);

    if (photosToAdd.length > 0) {
      setPhotos((currentPhotos) => {
        const availableCount = MAX_PHOTO_COUNT - currentPhotos.length;
        const nextPhotosToAdd = photosToAdd.slice(0, availableCount);
        const unusedPhotos = photosToAdd.slice(availableCount);

        unusedPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));

        const nextPhotos = [...currentPhotos, ...nextPhotosToAdd];

        photosRef.current = nextPhotos;
        photoUrlsRef.current = nextPhotos.map((photo) => photo.url);

        return nextPhotos;
      });
    }

    event.target.value = '';
  };

  const removePhoto = (targetPhoto: SelectedPhoto) => {
    URL.revokeObjectURL(targetPhoto.url);
    setPhotos((currentPhotos) => {
      const nextPhotos = currentPhotos.filter(
        (photo) => photo.id !== targetPhoto.id,
      );

      photosRef.current = nextPhotos;
      photoUrlsRef.current = nextPhotos.map((photo) => photo.url);

      return nextPhotos;
    });
    setMessage('');
  };

  const reorderPhotos = (sourcePhotoId: string, targetPhotoId: string) => {
    setPhotos((currentPhotos) => {
      const sourceIndex = currentPhotos.findIndex(
        (photo) => photo.id === sourcePhotoId,
      );
      const targetIndex = currentPhotos.findIndex(
        (photo) => photo.id === targetPhotoId,
      );

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return currentPhotos;
      }

      const nextPhotos = [...currentPhotos];
      const [movedPhoto] = nextPhotos.splice(sourceIndex, 1);

      nextPhotos.splice(targetIndex, 0, movedPhoto);
      photosRef.current = nextPhotos;
      photoUrlsRef.current = nextPhotos.map((photo) => photo.url);

      return nextPhotos;
    });
  };

  return {
    fileInputRef,
    hasSelectedPhotos,
    message,
    photos,
    photosRef,
    handlePhotoChange,
    openFilePicker,
    removePhoto,
    reorderPhotos,
  };
}

export default useTravelRecordPhotoSelection;
