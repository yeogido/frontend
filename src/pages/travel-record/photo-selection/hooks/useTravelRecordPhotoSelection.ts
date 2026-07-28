import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import type { SelectedPhoto } from '../types';
import {
  MAX_PHOTO_COUNT,
  validateTravelRecordPhotos,
} from '../photoValidation';
import { useToast } from '../../../../components/toast';
import { getTravelRecordPhotoDraft } from '../../utils/travelRecordSave';


function useTravelRecordPhotoSelection(restoreDraft = false) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<SelectedPhoto[]>([]);
  const photoUrlsRef = useRef<string[]>([]);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const { showToast } = useToast();
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
    if (!restoreDraft) {
      return;
    }

    let isMounted = true;
    void getTravelRecordPhotoDraft().then((files) => {
      if (!isMounted) {
        return;
      }
      setPhotos(files.map((file) => ({
        id: `${file.name}-${file.lastModified}-draft`,
        file,
        url: URL.createObjectURL(file),
      })));
    });

    return () => {
      isMounted = false;
    };
  }, [restoreDraft]);

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

    if (message) {
      showToast(message);
    }

    if (photosToAdd.length > 0) {
      const availableCount = MAX_PHOTO_COUNT - photosRef.current.length;
      const nextPhotosToAdd = photosToAdd.slice(0, availableCount);
      const unusedPhotos = photosToAdd.slice(availableCount);

      unusedPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
      setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotosToAdd]);
    }

    event.target.value = '';
  };

  const removePhoto = (targetPhoto: SelectedPhoto) => {
    URL.revokeObjectURL(targetPhoto.url);
    setPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== targetPhoto.id),
    );
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

      return nextPhotos;
    });
  };

  return {
    fileInputRef,
    hasSelectedPhotos,
    photos,
    photosRef,
    handlePhotoChange,
    openFilePicker,
    removePhoto,
    reorderPhotos,
  };
}

export default useTravelRecordPhotoSelection;
