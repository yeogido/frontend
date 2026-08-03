export const getVisibleFolderPhotos = (photos: string[]) =>
  photos.filter((photo) => photo.trim().length > 0).slice(0, 2);

export const getFolderPhotoSlotIndexes = (photoCount: number) => {
  if (photoCount === 1) {
    return [1];
  }

  return photoCount > 1 ? [0, 1] : [];
};
