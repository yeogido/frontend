import { useEffect, useRef, useState } from 'react';

import type { PlaceItem } from '../types';

export function usePlacePhotoModal() {
  const [pendingPlace, setPendingPlace] = useState<PlaceItem | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreviewUrl, setPendingImagePreviewUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const pendingImagePreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingImagePreviewUrlRef.current) {
        URL.revokeObjectURL(pendingImagePreviewUrlRef.current);
      }
    };
  }, []);

  const handlePlaceAdd = (place: PlaceItem) => {
    setPendingPlace(place);
    setIsImageModalOpen(true);
  };

  const clearPendingImage = () => {
    if (pendingImagePreviewUrlRef.current) {
      URL.revokeObjectURL(pendingImagePreviewUrlRef.current);
      pendingImagePreviewUrlRef.current = null;
    }

    setPendingImageFile(null);
    setPendingImagePreviewUrl(null);
  };

  const closeImageModal = () => {
    clearPendingImage();
    setPendingPlace(null);
    setIsImageModalOpen(false);
  };

  const handleImageFileChange = (file: File) => {
    clearPendingImage();

    const previewUrl = URL.createObjectURL(file);
    pendingImagePreviewUrlRef.current = previewUrl;
    setPendingImageFile(file);
    setPendingImagePreviewUrl(previewUrl);
  };

  const clearModalState = () => {
    pendingImagePreviewUrlRef.current = null;
    setPendingPlace(null);
    setPendingImageFile(null);
    setPendingImagePreviewUrl(null);
    setIsImageModalOpen(false);
  };

  return {
    pendingPlace,
    pendingImageFile,
    pendingImagePreviewUrl,
    isImageModalOpen,
    handlePlaceAdd,
    closeImageModal,
    handleImageFileChange,
    clearModalState,
  };
}
