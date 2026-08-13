export const MAX_PHOTO_COUNT = 5;
export const MAX_PHOTO_FILE_SIZE = 100 * 1024 * 1024;

const supportedPhotoTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

interface PhotoValidationResult {
  files: File[];
  message: string;
}

export const validateTravelRecordPhotos = (
  selectedFiles: File[],
  remainingCount: number,
): PhotoValidationResult => {
  const imageFiles = selectedFiles.filter((file) =>
    supportedPhotoTypes.has(file.type),
  );
  const sizeValidFiles = imageFiles.filter(
    (file) => file.size <= MAX_PHOTO_FILE_SIZE,
  );
  const files = sizeValidFiles.slice(0, remainingCount);

  if (imageFiles.length !== selectedFiles.length) {
    return {
      files,
      message: '이미지 파일만 추가할 수 있어요',
    };
  }

  if (sizeValidFiles.length !== imageFiles.length) {
    return {
      files,
      message: '사진은 100MB 이하만 추가할 수 있어요',
    };
  }

  if (sizeValidFiles.length > remainingCount) {
    return {
      files,
      message: `사진은 최대 ${MAX_PHOTO_COUNT}장까지 선택할 수 있어요`,
    };
  }

  return { files, message: '' };
};
