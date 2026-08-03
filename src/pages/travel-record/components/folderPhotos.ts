export const getVisibleFolderPhotos = (photos: string[]) =>
  photos.filter((photo) => photo.trim().length > 0).slice(0, 2);

/**
 * 사진 순서를 폴더 슬롯(0: 왼쪽, 1: 오른쪽)에 배치한다.
 *
 * 첫 사진이 대표 사진이므로 항상 오른쪽 슬롯에 둔다. 오른쪽이 왼쪽 위로
 * 겹쳐 올라와 가장 잘 보이는 자리다.
 */
export const getFolderPhotoSlotIndexes = (photoCount: number) => {
  if (photoCount === 1) {
    return [1];
  }

  return photoCount > 1 ? [1, 0] : [];
};
